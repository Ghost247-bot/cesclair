const crypto = require('crypto');

/**
 * Generate a secure BETTER_AUTH_SECRET
 * 
 * Usage: node scripts/generate-auth-secret.js
 */

const secret = crypto.randomBytes(32).toString('base64');

console.log('\n🔐 Generated BETTER_AUTH_SECRET:\n');
console.log(secret);
console.log('\n📋 Copy this value and add it to:');
console.log('   - Your .env.local file: BETTER_AUTH_SECRET=' + secret);
console.log('   - Netlify environment variables: BETTER_AUTH_SECRET = ' + secret);
console.log('\n⚠️  Keep this secret secure and never commit it to git!\n');

