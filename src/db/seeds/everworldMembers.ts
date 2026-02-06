import { db } from '@/db';
import { user, CesworldMembers } from '@/db/schema';

async function main() {
    // First, insert users to satisfy foreign key constraint
    const sampleUsers = [
        {
            id: 'user_001',
            name: 'Sarah Mitchell',
            email: 'sarah.mitchell@example.com',
            emailVerified: true,
            createdAt: new Date('2024-01-15T10:00:00.000Z'),
            updatedAt: new Date('2024-01-15T10:00:00.000Z'),
        },
        {
            id: 'user_002',
            name: 'David Chen',
            email: 'david.chen@example.com',
            emailVerified: true,
            createdAt: new Date('2023-06-10T14:30:00.000Z'),
            updatedAt: new Date('2023-06-10T14:30:00.000Z'),
        },
        {
            id: 'user_003',
            name: 'Emma Rodriguez',
            email: 'emma.rodriguez@example.com',
            emailVerified: true,
            createdAt: new Date('2022-09-01T11:20:00.000Z'),
            updatedAt: new Date('2022-09-01T11:20:00.000Z'),
        },
    ];

    await db.insert(user).values(sampleUsers);

    // Now insert Cesworld members with correct foreign key references
    const sampleCesworldMembers = [
        {
            userId: 'user_001',
            tier: 'member',
            points: 250,
            annualSpending: '350.00',
            birthdayMonth: 3,
            birthdayDay: 15,
            joinedAt: '2024-01-15T10:00:00.000Z',
            lastTierUpdate: '2024-01-15T10:00:00.000Z',
        },
        {
            userId: 'user_002',
            tier: 'plus',
            points: 875,
            annualSpending: '750.00',
            birthdayMonth: 7,
            birthdayDay: 22,
            joinedAt: '2023-06-10T14:30:00.000Z',
            lastTierUpdate: '2024-02-20T09:15:00.000Z',
        },
        {
            userId: 'user_003',
            tier: 'premier',
            points: 2150,
            annualSpending: '1450.00',
            birthdayMonth: 11,
            birthdayDay: 8,
            joinedAt: '2022-09-01T11:20:00.000Z',
            lastTierUpdate: '2024-03-05T16:45:00.000Z',
        },
    ];

    await db.insert(CesworldMembers).values(sampleCesworldMembers);
    
    console.log(`✅ Cesworld members seeder completed successfully - Created ${sampleUsers.length} users and ${sampleCesworldMembers.length} members`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});