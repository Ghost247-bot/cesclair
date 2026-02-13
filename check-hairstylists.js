const { db } = require('./src/db/index.js');
const { hairstylists } = require('./src/db/schema.js');
const { eq } = require('drizzle-orm');

async function checkHairstylists() {
  try {
    const all = await db.select().from(hairstylists);
    const approved = await db.select().from(hairstylists).where(eq(hairstylists.status, 'approved'));
    const pending = await db.select().from(hairstylists).where(eq(hairstylists.status, 'pending'));
    
    console.log('Total hairstylists:', all.length);
    console.log('Approved hairstylists:', approved.length);
    console.log('Pending hairstylists:', pending.length);
    
    if (all.length > 0) {
      console.log('\nAll hairstylists:');
      all.forEach(h => console.log(`- ${h.name} (status: ${h.status})`));
    }
    
    if (approved.length > 0) {
      console.log('\nApproved hairstylists:');
      approved.forEach(h => console.log(`- ${h.name} (ID: ${h.id})`));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkHairstylists();
