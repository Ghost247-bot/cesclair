const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('Checking if banner_url column exists...');
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'designers' AND column_name = 'banner_url'
    `);

    if (checkResult.rows.length === 0) {
      console.log('Adding banner_url column to designers table...');
      await pool.query('ALTER TABLE "designers" ADD COLUMN "banner_url" text');
      console.log('✅ Successfully added banner_url column');
    } else {
      console.log('ℹ️ banner_url column already exists');
    }
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
