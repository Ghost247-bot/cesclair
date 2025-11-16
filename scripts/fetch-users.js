const { Pool } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function fetchUsers() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('Please set DATABASE_URL in your .env or .env.local file');
    process.exit(1);
  }

  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  try {
    console.log('🔍 Fetching all users from database...\n');

    // Fetch all users with their roles
    const result = await pool.query(`
      SELECT 
        id,
        name,
        email,
        role,
        phone,
        email_verified,
        created_at,
        updated_at
      FROM "user"
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('📭 No users found in the database.');
      return;
    }

    console.log(`✅ Found ${result.rows.length} user(s):\n`);
    console.log('─'.repeat(100));
    console.log(
      'ID'.padEnd(30) + 
      'Name'.padEnd(25) + 
      'Email'.padEnd(35) + 
      'Role'.padEnd(10)
    );
    console.log('─'.repeat(100));

    result.rows.forEach((user, index) => {
      const id = (user.id || '').substring(0, 28) + (user.id?.length > 28 ? '..' : '');
      const name = (user.name || 'N/A').substring(0, 23) + (user.name?.length > 23 ? '..' : '');
      const email = (user.email || 'N/A').substring(0, 33) + (user.email?.length > 33 ? '..' : '');
      const role = (user.role || 'member').padEnd(10);

      console.log(
        id.padEnd(30) + 
        name.padEnd(25) + 
        email.padEnd(35) + 
        role
      );
    });

    console.log('─'.repeat(100));
    console.log(`\n📊 Summary:`);
    console.log(`   Total users: ${result.rows.length}`);
    
    // Count by role
    const roleCounts = {};
    result.rows.forEach(user => {
      const role = user.role || 'member';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    console.log(`   By role:`);
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`     - ${role}: ${count}`);
    });

    // Show detailed info if requested
    if (process.argv.includes('--detailed') || process.argv.includes('-d')) {
      console.log('\n📋 Detailed User Information:\n');
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'N/A'} (${user.email || 'N/A'})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Role: ${user.role || 'member'}`);
        console.log(`   Phone: ${user.phone || 'N/A'}`);
        console.log(`   Email Verified: ${user.email_verified ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}`);
        console.log(`   Updated: ${user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    if (error.code === '42P01') {
      console.error('   The "user" table does not exist. Please run migrations first.');
      console.error('   Run: npm run db:push');
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('connection')) {
      console.error('   Database connection failed. Please check your DATABASE_URL.');
    } else {
      console.error('   Full error:', error);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fetchUsers();

