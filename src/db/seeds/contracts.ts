import { db } from '@/db';
import { contracts } from '@/db/schema';

async function main() {
    const sampleContracts = [
        {
            designerId: 1,
            designId: 1,
            title: 'Fall Collection Knitwear Line',
            description: 'Design and produce 5 knitwear pieces for fall collection',
            amount: '15000.00',
            status: 'completed',
            awardedAt: '2024-01-15T10:00:00.000Z',
            completedAt: '2024-03-20T14:30:00.000Z',
            createdAt: '2024-01-10T09:00:00.000Z',
        },
        {
            designerId: 3,
            designId: 5,
            title: 'Premium Leather Accessories Collection',
            description: 'Create exclusive leather accessories line',
            amount: '22000.00',
            status: 'completed',
            awardedAt: '2024-02-01T11:00:00.000Z',
            completedAt: '2024-04-15T16:00:00.000Z',
            createdAt: '2024-01-25T10:30:00.000Z',
        },
        {
            designerId: 2,
            designId: 3,
            title: 'Denim Capsule Collection',
            description: 'Contemporary denim collection with 8 pieces',
            amount: '18500.00',
            status: 'awarded',
            awardedAt: '2024-03-10T09:30:00.000Z',
            completedAt: null,
            createdAt: '2024-03-01T14:00:00.000Z',
        },
        {
            designerId: 4,
            designId: 7,
            title: 'Athletic Footwear Line',
            description: 'Performance footwear for active lifestyle',
            amount: '25000.00',
            status: 'awarded',
            awardedAt: '2024-03-15T10:00:00.000Z',
            completedAt: null,
            createdAt: '2024-03-05T11:00:00.000Z',
        },
        {
            designerId: 5,
            designId: 9,
            title: 'Winter Outerwear Collection',
            description: 'Premium winter coats and jackets',
            amount: '20000.00',
            status: 'awarded',
            awardedAt: '2024-04-01T13:00:00.000Z',
            completedAt: null,
            createdAt: '2024-03-20T09:00:00.000Z',
        },
        {
            designerId: 6,
            designId: 11,
            title: "Men's Tailoring Collection",
            description: 'Modern menswear with focus on tailoring',
            amount: '17500.00',
            status: 'awarded',
            awardedAt: '2024-04-10T10:30:00.000Z',
            completedAt: null,
            createdAt: '2024-04-01T15:00:00.000Z',
        },
        {
            designerId: 1,
            designId: 2,
            title: 'Sustainable Knitwear Project',
            description: 'Eco-friendly knitwear using organic materials',
            amount: '14000.00',
            status: 'awarded',
            awardedAt: '2024-04-15T11:00:00.000Z',
            completedAt: null,
            createdAt: '2024-04-05T10:00:00.000Z',
        },
        {
            designerId: 2,
            designId: null,
            title: 'Street Style Denim Collection',
            description: 'Urban denim designs for contemporary market',
            amount: '19000.00',
            status: 'pending',
            awardedAt: null,
            completedAt: null,
            createdAt: '2024-04-20T12:00:00.000Z',
        },
    ];

    const createdContracts = await db.insert(contracts).values(sampleContracts).returning();

    const statusBreakdown = {
        completed: createdContracts.filter(c => c.status === 'completed').length,
        awarded: createdContracts.filter(c => c.status === 'awarded').length,
        pending: createdContracts.filter(c => c.status === 'pending').length,
    };

    console.log(`✅ Contracts seeder completed successfully`);
    console.log(`   Total contracts created: ${createdContracts.length}`);
    console.log(`   Status breakdown:`);
    console.log(`   - Completed: ${statusBreakdown.completed}`);
    console.log(`   - Awarded: ${statusBreakdown.awarded}`);
    console.log(`   - Pending: ${statusBreakdown.pending}`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});