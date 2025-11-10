import { db } from '@/db';
import { CesworldRewards } from '@/db/schema';

async function main() {
    const sampleRewards = [
        // MEMBER 1 - 1 reward
        {
            memberId: 1,
            rewardType: 'discount',
            pointsCost: 100,
            amountOff: '10.00',
            status: 'used',
            redeemedAt: '2024-03-15T10:00:00.000Z',
            usedAt: '2024-03-16T14:25:00.000Z',
            expiresAt: '2024-06-13T10:00:00.000Z',
        },
        // MEMBER 2 - 2 rewards
        {
            memberId: 2,
            rewardType: 'discount',
            pointsCost: 100,
            amountOff: '10.00',
            status: 'used',
            redeemedAt: '2024-08-05T13:20:00.000Z',
            usedAt: '2024-08-10T09:15:00.000Z',
            expiresAt: '2024-11-03T13:20:00.000Z',
        },
        {
            memberId: 2,
            rewardType: 'birthday_gift',
            pointsCost: 0,
            amountOff: '15.00',
            status: 'active',
            redeemedAt: '2024-07-22T00:00:00.000Z',
            usedAt: null,
            expiresAt: '2024-12-31T23:59:59.000Z',
        },
        // MEMBER 3 - 3 rewards
        {
            memberId: 3,
            rewardType: 'discount',
            pointsCost: 200,
            amountOff: '20.00',
            status: 'used',
            redeemedAt: '2024-11-20T11:30:00.000Z',
            usedAt: '2024-11-22T16:45:00.000Z',
            expiresAt: '2025-02-18T11:30:00.000Z',
        },
        {
            memberId: 3,
            rewardType: 'free_shipping',
            pointsCost: 50,
            amountOff: '0.00',
            status: 'active',
            redeemedAt: '2024-12-01T10:00:00.000Z',
            usedAt: null,
            expiresAt: '2025-03-01T10:00:00.000Z',
        },
        {
            memberId: 3,
            rewardType: 'birthday_gift',
            pointsCost: 0,
            amountOff: '25.00',
            status: 'active',
            redeemedAt: '2024-11-08T00:00:00.000Z',
            usedAt: null,
            expiresAt: '2024-12-31T23:59:59.000Z',
        },
    ];

    await db.insert(CesworldRewards).values(sampleRewards);
    
    console.log(`✅ Cesworld rewards seeder completed successfully - Created ${sampleRewards.length} rewards for 3 members`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});