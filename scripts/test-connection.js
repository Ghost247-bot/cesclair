const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

/**
 * Quick Database Connection Test
 * 
 * Tests if the DATABASE_URL connection string works
 */

async function testConnection() {
  // You can also pass connection string as command line argument
  const connectionString = process.argv[2] || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ No connection string provided!');
    console.log('\nUsage:');
    console.log('  node scripts/test-connection.js');
    console.log('  OR');
    console.log('  node scripts/test-connection.js "postgresql://user:pass@host/db"');
    console.log('\nMake sure DATABASE_URL is set in .env file');
    process.exit(1);
  }

  console.log('🔌 Testing database connection...');
  console.log('Connection:', connectionString.replace(/:[^:@]+@/, ':****@'));
  
  const pool = new Pool({ 
    connectionString: connectionString,
    max: 1,
  });

  try {
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW() as time, version() as version, current_database() as database');
    const duration = Date.now() - startTime;
    
    console.log('\n✅ Connection successful!');
    console.log('   Response time:', duration + 'ms');
    console.log('   Database:', result.rows[0].database);
    console.log('   Server time:', result.rows[0].time);
    console.log('   PostgreSQL:', result.rows[0].version.split(',')[0]);
    
    // Test a simple query
    const tableCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('   Tables in database:', tableCheck.rows[0].count);
    
    console.log('\n✅ All checks passed!');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Hostname not found. Check your connection string.');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check username and password.');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Check database name.');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Connection timeout. Database may be sleeping (Neon free tier).');
      console.error('   Try again - first connection wakes the database.');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection().catch(console.error);

