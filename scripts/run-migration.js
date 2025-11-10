const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function runMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'drizzle', '0003_add_audit_logs.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration: 0003_add_audit_logs.sql');
    console.log('SQL:', sql);
    
    // Split by statement breakpoint and execute each statement
    const statements = sql.split('--> statement-breakpoint').filter(s => s.trim());
    
    for (const statement of statements) {
      const cleanStatement = statement.trim();
      if (cleanStatement) {
        console.log('\nExecuting statement...');
        await pool.query(cleanStatement);
        console.log('✓ Statement executed successfully');
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '42P07') {
      console.log('Note: Table might already exist. This is okay.');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

runMigration();

