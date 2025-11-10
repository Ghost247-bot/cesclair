import { db } from '@/db';
import { designs } from '@/db/schema';

async function main() {
    const timestamp = new Date().toISOString();
    
    const sampleDesigns = [
        {
            designerId: 1,
            title: 'Merino Wool Cable Knit Sweater',
            description: 'Luxurious cable knit sweater made from 100% merino wool',
            imageUrl: 'https://picsum.photos/seed/design1/400/400',
            category: 'sweaters',
            status: 'approved',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 1,
            title: 'Organic Cotton Cardigan',
            description: 'Sustainable cardigan with wooden buttons',
            imageUrl: 'https://picsum.photos/seed/design2/400/400',
            category: 'sweaters',
            status: 'approved',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 2,
            title: 'Vintage Wash Slim Fit Jeans',
            description: 'Contemporary denim with authentic vintage treatment',
            imageUrl: 'https://picsum.photos/seed/design3/400/400',
            category: 'pants',
            status: 'approved',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 2,
            title: 'Raw Selvedge Denim Jacket',
            description: 'Premium Japanese selvedge denim jacket',
            imageUrl: 'https://picsum.photos/seed/design4/400/400',
            category: 'jackets',
            status: 'submitted',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 3,
            title: 'Italian Leather Tote Bag',
            description: 'Handcrafted tote bag from premium Italian leather',
            imageUrl: 'https://picsum.photos/seed/design5/400/400',
            category: 'accessories',
            status: 'approved',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 3,
            title: 'Crossbody Messenger Bag',
            description: 'Compact messenger bag with adjustable strap',
            imageUrl: 'https://picsum.photos/seed/design6/400/400',
            category: 'accessories',
            status: 'approved',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 4,
            title: 'Performance Running Sneakers',
            description: 'Lightweight sneakers with advanced cushioning technology',
            imageUrl: 'https://picsum.photos/seed/design7/400/400',
            category: 'footwear',
            status: 'approved',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 4,
            title: 'Classic White Leather Sneakers',
            description: 'Minimalist white sneakers with premium leather upper',
            imageUrl: 'https://picsum.photos/seed/design8/400/400',
            category: 'footwear',
            status: 'draft',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 5,
            title: 'Wool Blend Overcoat',
            description: 'Elegant overcoat with modern tailoring',
            imageUrl: 'https://picsum.photos/seed/design9/400/400',
            category: 'coats',
            status: 'approved',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 5,
            title: 'Quilted Puffer Jacket',
            description: 'Warm puffer jacket with sustainable insulation',
            imageUrl: 'https://picsum.photos/seed/design10/400/400',
            category: 'jackets',
            status: 'submitted',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 6,
            title: 'Tailored Wool Trousers',
            description: 'Classic wool trousers with perfect fit',
            imageUrl: 'https://picsum.photos/seed/design11/400/400',
            category: 'pants',
            status: 'approved',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            designerId: 6,
            title: 'Minimalist Cotton Oxford Shirt',
            description: 'Contemporary oxford shirt in premium cotton',
            imageUrl: 'https://picsum.photos/seed/design12/400/400',
            category: 'shirts',
            status: 'approved',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    ];

    const createdDesigns = await db.insert(designs).values(sampleDesigns).returning();
    
    console.log(`✅ Designs seeder completed successfully - Created ${createdDesigns.length} designs`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});