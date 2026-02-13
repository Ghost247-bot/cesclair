const { neon } = require('@neondatabase/serverless');

async function checkHairstylistData() {
  try {
    const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/cesclair?sslmode=require';
    console.log('DATABASE_URL:', connectionString);
    
    const sql = neon(connectionString);
    
    // Fetch all hairstylists
    const hairstylists = await sql`
      SELECT id, name, email, bio, avatar_url, banner_url, specialties, status, created_at, updated_at 
      FROM hairstylists 
      WHERE status = 'approved' 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    console.log('\n=== HAIRSTYLIST DATA ===');
    console.log('Total approved hairstylists:', hairstylists.length);
    
    if (hairstylists.length === 0) {
      console.log('No approved hairstylists found in database');
      
      // Check if there are any hairstylists at all
      const allHairstylists = await sql`SELECT COUNT(*) as count FROM hairstylists`;
      console.log('Total hairstylists in database:', allHairstylists[0].count);
      
      // Check table structure
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'hairstylists'
        ORDER BY ordinal_position
      `;
      console.log('\n=== TABLE STRUCTURE ===');
      console.log(JSON.stringify(columns, null, 2));
    } else {
      hairstylists.forEach((stylist, index) => {
        console.log(`\n--- Hairstylist ${index + 1} ---`);
        console.log('ID:', stylist.id);
        console.log('Name:', stylist.name);
        console.log('Email:', stylist.email);
        console.log('Bio:', stylist.bio);
        console.log('Avatar URL:', stylist.avatar_url);
        console.log('Banner URL:', stylist.banner_url);
        console.log('Specialties:', stylist.specialties);
        console.log('Status:', stylist.status);
        console.log('Created:', stylist.created_at);
        console.log('Updated:', stylist.updated_at);
      });
    }
    
    // Check if uploads directory has files
    const fs = require('fs');
    const path = require('path');
    
    const bannerDir = path.join(__dirname, 'public', 'uploads', 'hairstylists', 'banners');
    const avatarDir = path.join(__dirname, 'public', 'uploads', 'hairstylists', 'avatars');
    
    console.log('\n=== UPLOAD DIRECTORIES ===');
    console.log('Banner directory:', bannerDir);
    console.log('Banner directory exists:', fs.existsSync(bannerDir));
    
    if (fs.existsSync(bannerDir)) {
      const bannerFiles = fs.readdirSync(bannerDir);
      console.log('Banner files:', bannerFiles);
    }
    
    console.log('Avatar directory:', avatarDir);
    console.log('Avatar directory exists:', fs.existsSync(avatarDir));
    
    if (fs.existsSync(avatarDir)) {
      const avatarFiles = fs.readdirSync(avatarDir);
      console.log('Avatar files:', avatarFiles);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkHairstylistData();
