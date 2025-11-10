/**
 * Script to create or update an admin user
 * Run with: node scripts/create-admin.js
 * Or with custom credentials: node scripts/create-admin.js <email> <password> <name>
 */

const args = process.argv.slice(2);
const email = args[0] || 'rogerbeaudry@yahoo.com';
const password = args[1] || 'Gold4me.471@1761';
const name = args[2] || 'Admin User';

const baseURL = process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3002';

async function createAdminUser() {
  try {
    console.log('Creating/updating admin user...');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Base URL: ${baseURL}`);
    
    const response = await fetch(`${baseURL}/api/admin/create-admin-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ Success!');
      console.log(`Message: ${data.message}`);
      console.log(`User ID: ${data.user.id}`);
      console.log(`User Role: ${data.user.role}`);
      console.log('\n📝 Login Credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`\n🔗 Login at: ${baseURL}/everworld/login`);
    } else {
      console.error('\n❌ Error:', data.error || 'Unknown error');
      console.error('Code:', data.code);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Failed to create admin user:', error.message);
    console.error('\n💡 Make sure your Next.js dev server is running:');
    console.error('   npm run dev');
    process.exit(1);
  }
}

createAdminUser();

