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

// Image files with their descriptions and titles based on the provided image descriptions
const imageData = [
  {
    file: 'business-7607360_640.jpg',
    title: 'Professional Business Attire',
    description: 'Elegant business wear featuring sophisticated styling and professional design, perfect for the modern workplace.',
    category: 'Business Wear'
  },
  {
    file: 'catwalk-1840941_1280.jpg',
    title: 'Runway Fashion Showcase',
    description: 'A dynamic fashion show featuring models walking down a brightly lit runway, showcasing contemporary designs with dramatic lighting.',
    category: 'Ready-to-Wear'
  },
  {
    file: 'fashion-4596664_640.jpg',
    title: 'Avant-Garde Fashion Collection',
    description: 'Bold and experimental designs featuring unique silhouettes, metallic textures, and futuristic elements that push fashion boundaries.',
    category: 'Avant-Garde'
  },
  {
    file: 'fashion-4922161_640.jpg',
    title: 'Elegant Evening Gown',
    description: 'A stunning floor-length evening gown in royal blue with a fitted bodice and dramatic flowing skirt, perfect for formal events.',
    category: 'Evening Wear'
  },
  {
    file: 'fashion-show-1746569_640.jpg',
    title: 'Fashion Show Lineup',
    description: 'A procession of models showcasing various contemporary outfits on a minimalist runway, featuring diverse styles and modern aesthetics.',
    category: 'Ready-to-Wear'
  },
  {
    file: 'fashion-show-1746570_640.jpg',
    title: 'Champagne Elegance Collection',
    description: 'Luxurious off-the-shoulder gowns in champagne and peach tones, featuring intricate embroidery and voluminous layered skirts with petal-like effects.',
    category: 'Evening Wear'
  },
  {
    file: 'fashion-show-1746581_1280.jpg',
    title: 'Diverse Runway Presentation',
    description: 'A fashion show featuring both male and female models in contemporary designs, showcasing vibrant patterns and modern silhouettes on a light purple runway.',
    category: 'Ready-to-Wear'
  },
  {
    file: 'fashion-show-1746587_640.jpg',
    title: 'Black Lace Evening Gown',
    description: 'An elegant black gown featuring intricate lace patterns on the bodice and a dramatic satin train, combining classic elegance with modern design.',
    category: 'Evening Wear'
  },
  {
    file: 'fashion-show-1746592_1280.jpg',
    title: 'Yellow Textured Dress',
    description: 'A vibrant yellow empire-waist dress with unique vertical strips of textured material, creating a striking visual effect perfect for special occasions.',
    category: 'Special Occasion'
  },
  {
    file: 'fashion-show-1746593_1280.jpg',
    title: 'Gold Patterned Cocktail Dress',
    description: 'A sophisticated one-shoulder cocktail dress with shimmering gold and bronze floral patterns, featuring a fitted silhouette and elegant styling.',
    category: 'Cocktail Wear'
  },
  {
    file: 'fashion-show-1746596_640.jpg',
    title: 'Dubai Fashion Week Showcase',
    description: 'An outdoor fashion show at night featuring elegant gowns against the iconic Burj Khalifa backdrop, showcasing luxury fashion in a dramatic urban setting.',
    category: 'Evening Wear'
  },
  {
    file: 'fashion-show-1746598_640.jpg',
    title: 'Cape and Bubble Shorts Ensemble',
    description: 'A unique contemporary outfit featuring a dark navy cape with gold lining, paired with voluminous light blue bubble shorts and metallic rose gold heels.',
    category: 'Avant-Garde'
  },
  {
    file: 'fashion-show-1746599_640.jpg',
    title: 'Coral Red Peplum Gown',
    description: 'A vibrant coral-red floor-length dress with a peplum waist detail, featuring a high slit and accessorized with an elaborate pearl necklace.',
    category: 'Evening Wear'
  },
  {
    file: 'fashion-show-1746601_640.jpg',
    title: 'White and Gold Blazer Suit',
    description: 'A sophisticated white blazer suit with striking gold lapels and piping, paired with a matching pencil skirt and metallic rose gold heels.',
    category: 'Business Wear'
  },
  {
    file: 'fashion-show-1746604_640.jpg',
    title: 'Orange High-Low Dress',
    description: 'A bold orange high-low dress with dramatic flared sleeves and unique white circular cutouts, creating a modern and artistic silhouette.',
    category: 'Artistic'
  },
  {
    file: 'fashion-show-1746610_640 (1) copy.jpg',
    title: 'Red Pleated Skirt Ensemble',
    description: 'A light beige top paired with a vibrant red pleated full skirt, accessorized with a delicate veil headpiece and gold heels.',
    category: 'Special Occasion'
  },
  {
    file: 'fashion-show-1746610_640 (1).jpg',
    title: 'Whimsical Fashion Duo',
    description: 'Two models showcasing playful designs featuring embellished sweaters with unicorn and floral motifs, paired with voluminous tulle skirts and bubble shorts.',
    category: 'Artistic'
  },
  {
    file: 'fashion-show-1746610_640.jpg',
    title: 'Veiled Baseball Cap Look',
    description: 'A creative ensemble featuring a white baseball cap with a delicate veil, a tied light blue shirt, and a voluminous black ruffled high-low skirt.',
    category: 'Avant-Garde'
  },
  {
    file: 'fashion-show-1746616_640.jpg',
    title: 'Metallic Warrior Goddess Gown',
    description: 'An avant-garde floor-length gown with a golden spiky headpiece, heavily embellished with gold sequins, and a voluminous ruffled train.',
    category: 'Haute Couture'
  },
  {
    file: 'fashion-show-1746618_640.jpg',
    title: 'Bridal Lace Collection',
    description: 'A collection of intricate white lace dresses with elaborate floral appliques, featuring unique headpieces and platform wedge boots.',
    category: 'Bridal'
  },
  {
    file: 'fashion-show-1746621_640.jpg',
    title: 'Black Kimono-Sleeve Dress',
    description: 'A sophisticated black midi dress with wide flowing kimono-style sleeves, featuring gold embellishments and a feathered hemline.',
    category: 'Ready-to-Wear'
  },
  {
    file: 'fashion-show-1746622_640.jpg',
    title: 'Two-Tone Mini Dress',
    description: 'A form-fitting mini dress combining white and beige pinstriped fabrics with diagonal ruching, creating a modern and chic silhouette.',
    category: 'Ready-to-Wear'
  },
  {
    file: 'high-fashion-4905868_640.jpg',
    title: 'VR Headset Avant-Garde Look',
    description: 'A futuristic fashion statement featuring a VR headset, large black ruffled headpiece, silver snakeskin-patterned jacket, and voluminous black tulle skirt.',
    category: 'Avant-Garde'
  },
  {
    file: 'seamstress-6921154_640.jpg',
    title: 'Vintage Sewing Studio',
    description: 'A vintage-inspired portrait featuring a woman at an antique sewing machine with floating spools of thread, celebrating craftsmanship and creativity.',
    category: 'Artistic'
  },
  {
    file: 'seamstress-6921155_640.jpg',
    title: 'Digital Design Workspace',
    description: 'A modern workspace scene featuring a woman using a tablet and stylus, surrounded by vibrant abstract patterns, representing contemporary design processes.',
    category: 'Artistic'
  },
  {
    file: 'sewing-1229731_640.jpg',
    title: 'Craftsmanship Still Life',
    description: 'An artistic still life composition featuring golden and yellow thread spools with a measuring tape, arranged on a reflective surface against a blue backdrop.',
    category: 'Artistic'
  },
  {
    file: 'woman-7607341_640.jpg',
    title: 'Professional Portrait',
    description: 'A professional portrait of a woman in a colorful striped top, engaged in work at a modern desk setup with vibrant background patterns.',
    category: 'Portrait'
  },
  {
    file: 'woman-7607350_640.jpg',
    title: 'Business Professional',
    description: 'A professional business portrait featuring a woman in contemporary business attire, representing modern workplace fashion and style.',
    category: 'Business Wear'
  }
];

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
  console.log('Starting design seeding process with image descriptions...\n');

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

  if (foundDesigners.length < 4) {
    console.warn(`\n⚠ Warning: Only found ${foundDesigners.length} designer(s), expected 4. Continuing with available designers...`);
  }

  console.log(`\nFound ${foundDesigners.length} designer(s)\n`);

  // Distribute images among designers (8 designs each)
  let imageIndex = 0;

  for (const designer of foundDesigners) {
    console.log(`\nCreating designs for ${designer.name} (${designer.email})...`);
    
    for (let i = 0; i < 8; i++) {
      // Get image data (cycle through available images)
      const imageInfo = imageData[imageIndex % imageData.length];
      const imageUrl = `/uploads/avatars/${imageInfo.file}`;
      
      try {
        const design = await createDesign(
          designer.id,
          imageInfo.title,
          imageInfo.description,
          imageUrl,
          imageInfo.category
        );
        
        console.log(`  ✓ Created design #${i + 1}: "${imageInfo.title}" (${imageInfo.category})`);
        imageIndex++;
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

