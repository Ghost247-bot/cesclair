import 'dotenv/config';
import { db } from '../index';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        console.log('🔍 Checking if role column exists in user table...');
        
        // Check if role column exists
        const result = await db.execute(sql`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'user' AND column_name = 'role'
        `);
        
        if (result.rows.length === 0) {
            console.log('⚠️  Role column does not exist. Adding it...');
            
            // Add role column
            await db.execute(sql`
                ALTER TABLE "user" 
                ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'member' NOT NULL
            `);
            
            console.log('✅ Role column added successfully!');
        } else {
            console.log('✅ Role column already exists.');
            console.log('Column details:', result.rows[0]);
        }
        
        // Verify the column was added
        const verifyResult = await db.execute(sql`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'user' AND column_name = 'role'
        `);
        
        if (verifyResult.rows.length > 0) {
            console.log('✅ Verification successful. Role column exists.');
        } else {
            console.error('❌ Failed to verify role column.');
            process.exit(1);
        }
        
        // Check if any users don't have a role set
        const usersWithoutRole = await db.execute(sql`
            SELECT COUNT(*) as count
            FROM "user"
            WHERE role IS NULL OR role = ''
        `);
        
        if (usersWithoutRole.rows[0] && parseInt(usersWithoutRole.rows[0].count as string) > 0) {
            console.log(`⚠️  Found ${usersWithoutRole.rows[0].count} users without role. Setting default role...`);
            await db.execute(sql`
                UPDATE "user"
                SET role = 'member'
                WHERE role IS NULL OR role = ''
            `);
            console.log('✅ Default role set for all users.');
        }
        
        console.log('\n🎉 Database schema check completed successfully!');
    } catch (error) {
        console.error('❌ Error checking/fixing role column:', error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});

