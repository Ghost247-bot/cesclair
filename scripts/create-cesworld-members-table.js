const { Pool } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function createCesworldMembersTable() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('Please set DATABASE_URL in your .env file or environment variables.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Checking if Cesworld_members table exists...');
    
    // Check if table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Cesworld_members'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('✅ Cesworld_members table already exists!');
      return;
    }
    
    console.log('📝 Creating Cesworld_members table...');
    
    // Create the table
    await pool.query(`
      CREATE TABLE "Cesworld_members" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "tier" text DEFAULT 'member' NOT NULL,
        "points" integer DEFAULT 0 NOT NULL,
        "annual_spending" text DEFAULT '0.00' NOT NULL,
        "birthday_month" integer,
        "birthday_day" integer,
        "joined_at" timestamp DEFAULT now() NOT NULL,
        "last_tier_update" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    console.log('✅ Cesworld_members table created successfully!');
    
    // Check if user table exists before adding foreign key
    const checkUserTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user'
      );
    `);
    
    if (checkUserTable.rows[0].exists) {
      console.log('📝 Adding foreign key constraint to user table...');
      try {
        await pool.query(`
          ALTER TABLE "Cesworld_members" 
          ADD CONSTRAINT "Cesworld_members_user_id_user_id_fk" 
          FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") 
          ON DELETE no action ON UPDATE no action;
        `);
        console.log('✅ Foreign key constraint added successfully!');
      } catch (fkError) {
        // Foreign key might already exist or there might be an issue
        if (fkError.code === '42710') {
          console.log('ℹ️  Foreign key constraint already exists, skipping...');
        } else {
          console.warn('⚠️  Could not add foreign key constraint:', fkError.message);
          console.log('You may need to add it manually later.');
        }
      }
    } else {
      console.warn('⚠️  User table does not exist. Foreign key constraint not added.');
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    if (error.code === '42P07') {
      console.log('ℹ️  Table might already exist with a different name.');
    }
    throw error;
  } finally {
    await pool.end();
  }
}

createCesworldMembersTable()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });

