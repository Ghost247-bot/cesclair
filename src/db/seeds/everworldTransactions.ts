import { db } from '@/db';
import { CesworldTransactions } from '@/db/schema';

async function main() {
    const sampleTransactions = [
        // MEMBER 1 - 4 transactions
        {
            memberId: 1,
            type: 'purchase',
            amount: '125.50',
            points: 125,
            description: 'Purchase - Order #ORD-10001',
            orderId: 'ORD-10001',
            createdAt: '2024-01-20T14:30:00.000Z',
        },
        {
            memberId: 1,
            type: 'purchase',
            amount: '89.99',
            points: 90,
            description: 'Purchase - Order #ORD-10045',
            orderId: 'ORD-10045',
            createdAt: '2024-02-15T11:20:00.000Z',
        },
        {
            memberId: 1,
            type: 'purchase',
            amount: '134.51',
            points: 135,
            description: 'Purchase - Order #ORD-10089',
            orderId: 'ORD-10089',
            createdAt: '2024-03-10T16:45:00.000Z',
        },
        {
            memberId: 1,
            type: 'redeem',
            amount: '10.00',
            points: -100,
            description: 'Redeemed 100 points for $10 off',
            orderId: null,
            createdAt: '2024-03-15T10:00:00.000Z',
        },
        // MEMBER 2 - 5 transactions
        {
            memberId: 2,
            type: 'purchase',
            amount: '200.00',
            points: 250,
            description: 'Purchase - Order #ORD-9876',
            orderId: 'ORD-9876',
            createdAt: '2023-07-15T09:30:00.000Z',
        },
        {
            memberId: 2,
            type: 'purchase',
            amount: '180.00',
            points: 225,
            description: 'Purchase - Order #ORD-9920',
            orderId: 'ORD-9920',
            createdAt: '2023-10-22T14:15:00.000Z',
        },
        {
            memberId: 2,
            type: 'purchase',
            amount: '370.00',
            points: 463,
            description: 'Purchase - Order #ORD-10012',
            orderId: 'ORD-10012',
            createdAt: '2024-01-08T11:45:00.000Z',
        },
        {
            memberId: 2,
            type: 'birthday_reward',
            amount: '0.00',
            points: 150,
            description: 'Birthday bonus points',
            orderId: null,
            createdAt: '2024-07-22T00:00:00.000Z',
        },
        {
            memberId: 2,
            type: 'redeem',
            amount: '10.00',
            points: -100,
            description: 'Redeemed 100 points for $10 off',
            orderId: null,
            createdAt: '2024-08-05T13:20:00.000Z',
        },
        // MEMBER 3 - 6 transactions
        {
            memberId: 3,
            type: 'purchase',
            amount: '450.00',
            points: 675,
            description: 'Purchase - Order #ORD-8523',
            orderId: 'ORD-8523',
            createdAt: '2023-01-12T10:20:00.000Z',
        },
        {
            memberId: 3,
            type: 'purchase',
            amount: '325.00',
            points: 488,
            description: 'Purchase - Order #ORD-8890',
            orderId: 'ORD-8890',
            createdAt: '2023-05-20T15:30:00.000Z',
        },
        {
            memberId: 3,
            type: 'purchase',
            amount: '275.00',
            points: 413,
            description: 'Purchase - Order #ORD-9245',
            orderId: 'ORD-9245',
            createdAt: '2023-09-08T12:45:00.000Z',
        },
        {
            memberId: 3,
            type: 'purchase',
            amount: '400.00',
            points: 600,
            description: 'Purchase - Order #ORD-9678',
            orderId: 'ORD-9678',
            createdAt: '2024-01-15T14:00:00.000Z',
        },
        {
            memberId: 3,
            type: 'birthday_reward',
            amount: '0.00',
            points: 200,
            description: 'Premier birthday bonus points',
            orderId: null,
            createdAt: '2024-11-08T00:00:00.000Z',
        },
        {
            memberId: 3,
            type: 'redeem',
            amount: '20.00',
            points: -200,
            description: 'Redeemed 200 points for $20 off',
            orderId: null,
            createdAt: '2024-11-20T11:30:00.000Z',
        },
    ];

    await db.insert(CesworldTransactions).values(sampleTransactions);
    
    console.log(`✅ Cesworld transactions seeder completed successfully - Created ${sampleTransactions.length} transaction records`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});