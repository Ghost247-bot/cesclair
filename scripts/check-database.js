const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

/**
 * Database Connection Checker
 * 
 * Verifies:
 * 1. Database connection works
 * 2. Required auth tables exist
 * 3. Table structures are correct
 */

async function checkDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('\nPlease set DATABASE_URL in your .env file or environment variables.');
    process.exit(1);
  }

  console.log('🔍 Checking database connection...');
  console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password
  
  const pool = new Pool({ 
    connectionString: connectionString,
    max: 1,
  });

  try {
    // Test connection
    console.log('\n1️⃣ Testing connection...');
    const testResult = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log('   PostgreSQL version:', testResult.rows[0].pg_version.split(',')[0]);
    console.log('   Server time:', testResult.rows[0].current_time);

    // Check required tables
    console.log('\n2️⃣ Checking required tables...');
    const requiredTables = ['user', 'session', 'account', 'verification'];
    const tableStatus = {};

    for (const tableName of requiredTables) {
      try {
        // Check if table exists
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);

        const exists = tableCheck.rows[0].exists;

        if (exists) {
          // Get row count
          const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
          const rowCount = parseInt(countResult.rows[0].count);
          
          // Get column info
          const columnsResult = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = $1
            ORDER BY ordinal_position;
          `, [tableName]);

          tableStatus[tableName] = {
            exists: true,
            rowCount: rowCount,
            columns: columnsResult.rows.map(col => ({
              name: col.column_name,
              type: col.data_type,
              nullable: col.is_nullable === 'YES'
            }))
          };
          console.log(`   ✅ ${tableName}: exists (${rowCount} rows, ${columnsResult.rows.length} columns)`);
        } else {
          tableStatus[tableName] = { exists: false };
          console.log(`   ❌ ${tableName}: MISSING`);
        }
      } catch (error) {
        tableStatus[tableName] = { exists: false, error: error.message };
        console.log(`   ❌ ${tableName}: ERROR - ${error.message}`);
      }
    }

    // Summary
    console.log('\n3️⃣ Summary:');
    const missingTables = requiredTables.filter(t => !tableStatus[t]?.exists);
    
    if (missingTables.length === 0) {
      console.log('✅ All required tables exist!');
      console.log('\n📊 Table Details:');
      requiredTables.forEach(tableName => {
        const status = tableStatus[tableName];
        if (status.exists) {
          console.log(`\n   ${tableName}:`);
          console.log(`     - Rows: ${status.rowCount}`);
          console.log(`     - Columns: ${status.columns.map(c => c.name).join(', ')}`);
        }
      });
    } else {
      console.log(`❌ Missing ${missingTables.length} table(s): ${missingTables.join(', ')}`);
      console.log('\n💡 To fix, run database migrations:');
      console.log('   npm run db:push');
      console.log('   OR manually apply SQL files from drizzle/ directory');
    }

    // Check for additional tables
    console.log('\n4️⃣ Checking for other application tables...');
    const allTablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const allTables = allTablesResult.rows.map(r => r.table_name);
    const otherTables = allTables.filter(t => !requiredTables.includes(t));
    
    if (otherTables.length > 0) {
      console.log(`   Found ${otherTables.length} additional table(s):`);
      otherTables.forEach(table => {
        console.log(`     - ${table}`);
      });
    } else {
      console.log('   No additional tables found');
    }

    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('\n❌ Database check failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Possible issues:');
      console.error('   - Database hostname is incorrect');
      console.error('   - Network connectivity issue');
    } else if (error.code === '28P01') {
      console.error('\n💡 Possible issues:');
      console.error('   - Database credentials are incorrect');
      console.error('   - User does not have access to the database');
    } else if (error.code === '3D000') {
      console.error('\n💡 Possible issues:');
      console.error('   - Database does not exist');
      console.error('   - Check database name in connection string');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Database connection timeout');
      console.error('   - Database may be in "sleep" mode (Neon free tier)');
      console.error('   - Try connecting again - first connection may wake the database');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the check
checkDatabase().catch(console.error);

