require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

// Initialize database connection
function getConnectionString() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set!');
  }
  return process.env.DATABASE_URL.trim();
}

const pool = new Pool({ 
  connectionString: getConnectionString(),
  max: 1,
});

// Designer emails - try multiple patterns for partial emails
const designerEmailPatterns = [
  ['mullersofia@cesclair.store'], // Full email
  ['rossi***@cesclair.store', 'rossi@cesclair.store', 'rossi1@cesclair.store', 'rossi2@cesclair.store'], // Try multiple patterns
  ['ishabellel**@cesclair.store', 'ishabellel@cesclair.store', 'ishabellel1@cesclair.store', 'ishabellel2@cesclair.store'], // Try multiple patterns
  ['sibailey**@cesclair.store', 'sibailey@cesclair.store', 'sibailey1@cesclair.store', 'sibailey2@cesclair.store'], // Try multiple patterns
];

// Image files available (from public/uploads/avatars/)
const imageFiles = [
  'business-7607360_640.jpg',
  'catwalk-1840941_1280.jpg',
  'fashion-4596664_640.jpg',
  'fashion-4922161_640.jpg',
  'fashion-show-1746569_640.jpg',
  'fashion-show-1746570_640.jpg',
  'fashion-show-1746581_1280.jpg',
  'fashion-show-1746587_640.jpg',
  'fashion-show-1746592_1280.jpg',
  'fashion-show-1746593_1280.jpg',
  'fashion-show-1746596_640.jpg',
  'fashion-show-1746598_640.jpg',
  'fashion-show-1746599_640.jpg',
  'fashion-show-1746601_640.jpg',
  'fashion-show-1746604_640.jpg',
  'fashion-show-1746610_640 (1).jpg',
  'fashion-show-1746610_640.jpg',
  'fashion-show-1746616_640.jpg',
  'fashion-show-1746618_640.jpg',
  'fashion-show-1746621_640.jpg',
  'fashion-show-1746622_640.jpg',
  'high-fashion-4905868_640.jpg',
  'seamstress-6921154_640.jpg',
  'seamstress-6921155_640.jpg',
  'woman-7607341_640.jpg',
  'woman-7607350_640.jpg',
  'ChatGPT Image Nov 12, 2025, 11_03_48 AM.svg',
];

// Design titles and descriptions based on image types
const designTemplates = [
  {
    title: 'Elegant Evening Gown Collection',
    description: 'A stunning collection of evening gowns featuring intricate details and luxurious fabrics, perfect for formal events and red carpet appearances.',
    category: 'Evening Wear',
  },
  {
    title: 'Modern Runway Showcase',
    description: 'Contemporary fashion pieces displayed on the runway, showcasing innovative designs and cutting-edge style.',
    category: 'Ready-to-Wear',
  },
  {
    title: 'Avant-Garde Fashion Statement',
    description: 'Bold and experimental designs that push the boundaries of traditional fashion, featuring unique silhouettes and artistic expression.',
    category: 'Avant-Garde',
  },
  {
    title: 'Classic Business Attire',
    description: 'Professional and sophisticated business wear designed for the modern professional, combining elegance with functionality.',
    category: 'Business Wear',
  },
  {
    title: 'Couture Bridal Collection',
    description: 'Exquisite bridal gowns with handcrafted details, delicate lacework, and timeless elegance for the perfect wedding day.',
    category: 'Bridal',
  },
  {
    title: 'Street Style Fashion Line',
    description: 'Urban-inspired designs that blend comfort with style, perfect for everyday wear with a fashion-forward edge.',
    category: 'Streetwear',
  },
  {
    title: 'Luxury Resort Collection',
    description: 'Sophisticated resort wear featuring flowing fabrics, vibrant colors, and elegant designs for vacation and leisure.',
    category: 'Resort Wear',
  },
  {
    title: 'Haute Couture Masterpiece',
    description: 'A masterpiece of haute couture featuring meticulous craftsmanship, premium materials, and unparalleled attention to detail.',
    category: 'Haute Couture',
  },
];

// Additional design templates for variety
const additionalTemplates = [
  {
    title: 'Sustainable Fashion Collection',
    description: 'Eco-conscious designs made from sustainable materials, promoting environmental responsibility without compromising style.',
    category: 'Sustainable Fashion',
  },
  {
    title: 'Vintage-Inspired Modern Wear',
    description: 'Contemporary pieces inspired by classic vintage styles, bringing timeless elegance to modern fashion.',
    category: 'Vintage Modern',
  },
  {
    title: 'Minimalist Luxury Collection',
    description: 'Clean lines and sophisticated simplicity define this minimalist collection, focusing on quality materials and perfect fit.',
    category: 'Minimalist',
  },
  {
    title: 'Artistic Expression Garments',
    description: 'Fashion as art, featuring bold prints, unique textures, and creative designs that make a statement.',
    category: 'Artistic',
  },
  {
    title: 'Professional Tailoring Excellence',
    description: 'Expertly tailored pieces showcasing precision craftsmanship and attention to detail for the discerning client.',
    category: 'Tailored',
  },
  {
    title: 'Festive Celebration Attire',
    description: 'Vibrant and celebratory designs perfect for special occasions, featuring rich colors and elegant details.',
    category: 'Special Occasion',
  },
  {
    title: 'Contemporary Casual Elegance',
    description: 'Effortlessly chic casual wear that transitions seamlessly from day to night with sophisticated styling.',
    category: 'Casual',
  },
  {
    title: 'Designer Signature Collection',
    description: 'A signature collection representing the designer\'s unique vision and style, featuring distinctive elements and premium quality.',
    category: 'Signature',
  },
];

// Combine templates
const allTemplates = [...designTemplates, ...additionalTemplates];

async function findDesignerByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT * FROM designers WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email.trim()]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error finding designer ${email}:`, error);
    return null;
  }
}

async function createDesign(designerId, title, description, imageUrl, category) {
  try {
    const now = new Date();
    const result = await pool.query(
      `INSERT INTO designs (designer_id, title, description, image_url, category, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [designerId, title, description, imageUrl, category, 'published', now, now]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error creating design "${title}":`, error);
    throw error;
  }
}

async function seedDesigns() {
  console.log('Starting design seeding process...\n');

  // Find all designers
  const foundDesigners = [];
  for (const emailPatterns of designerEmailPatterns) {
    let designer = null;
    
    for (const email of emailPatterns) {
      console.log(`Looking for designer: ${email}`);
      designer = await findDesignerByEmail(email);
      
      if (designer) {
        console.log(`✓ Found designer: ${designer.name} (ID: ${designer.id}, Email: ${designer.email})`);
        foundDesigners.push(designer);
        break;
      }
    }
    
    if (!designer) {
      console.log(`✗ Designer not found with any pattern: ${emailPatterns.join(', ')}`);
    }
  }

  if (foundDesigners.length === 0) {
    console.error('\n✗ No designers found! Please ensure the designers exist in the database.');
    process.exit(1);
  }

  console.log(`\nFound ${foundDesigners.length} designer(s)\n`);

  // Distribute images among designers (8 designs each)
  let imageIndex = 0;
  let templateIndex = 0;

  for (const designer of foundDesigners) {
    console.log(`\nCreating designs for ${designer.name} (${designer.email})...`);
    
    for (let i = 0; i < 8; i++) {
      // Get image URL (use /uploads/avatars/ path)
      const imageFile = imageFiles[imageIndex % imageFiles.length];
      const imageUrl = `/uploads/avatars/${imageFile}`;
      
      // Get template
      const template = allTemplates[templateIndex % allTemplates.length];
      
      try {
        const design = await createDesign(
          designer.id,
          template.title,
          template.description,
          imageUrl,
          template.category
        );
        
        console.log(`  ✓ Created design #${i + 1}: "${template.title}"`);
        imageIndex++;
        templateIndex++;
      } catch (error) {
        console.error(`  ✗ Failed to create design #${i + 1}:`, error.message);
      }
    }
  }

  console.log('\n✓ Design seeding completed!');
  await pool.end();
}

// Run the seeding
seedDesigns()
  .then(() => {
    console.log('\nScript completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });

