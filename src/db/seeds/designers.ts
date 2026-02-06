import { db } from '@/db';
import { designers } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const timestamp = new Date().toISOString();

    const sampleDesigners = [
        {
            name: 'Maya Rodriguez',
            email: 'maya.rodriguez@example.com',
            password: hashedPassword,
            bio: 'Specialist in sustainable knitwear design with 8 years of experience',
            portfolioUrl: 'https://mayarodriguez.design',
            specialties: 'knitwear, sustainable fashion, sweaters',
            status: 'approved',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            name: 'James Chen',
            email: 'james.chen@example.com',
            password: hashedPassword,
            bio: 'Award-winning denim designer focusing on contemporary streetwear',
            portfolioUrl: 'https://jameschen.studio',
            specialties: 'denim, streetwear, pants, jackets',
            status: 'approved',
            avatarUrl: 'https://i.pravatar.cc/150?img=2',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            name: 'Sofia Andersson',
            email: 'sofia.andersson@example.com',
            password: hashedPassword,
            bio: 'Luxury accessories designer with a focus on leather goods',
            portfolioUrl: 'https://sofiaandersson.com',
            specialties: 'accessories, handbags, leather goods',
            status: 'approved',
            avatarUrl: 'https://i.pravatar.cc/150?img=3',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            name: 'Marcus Johnson',
            email: 'marcus.j@example.com',
            password: hashedPassword,
            bio: 'Innovative footwear designer specializing in athletic and casual shoes',
            portfolioUrl: 'https://marcusjohnson.co',
            specialties: 'footwear, sneakers, athletic wear',
            status: 'approved',
            avatarUrl: 'https://i.pravatar.cc/150?img=4',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            name: 'Aisha Patel',
            email: 'aisha.patel@example.com',
            password: hashedPassword,
            bio: 'Contemporary fashion designer with expertise in outerwear and coats',
            portfolioUrl: 'https://aishapatel.fashion',
            specialties: 'outerwear, coats, jackets, winter fashion',
            status: 'approved',
            avatarUrl: 'https://i.pravatar.cc/150?img=5',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            name: 'Leo Nakamura',
            email: 'leo.nakamura@example.com',
            password: hashedPassword,
            bio: 'Minimalist designer focusing on contemporary menswear and tailoring',
            portfolioUrl: 'https://leonakamura.design',
            specialties: 'menswear, tailoring, minimalist fashion',
            status: 'approved',
            avatarUrl: 'https://i.pravatar.cc/150?img=6',
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    ];

    const createdDesigners = await db.insert(designers).values(sampleDesigners).returning();
    
    console.log(`✅ Designers seeder completed successfully - ${createdDesigners.length} designers created`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});