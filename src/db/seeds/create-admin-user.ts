import 'dotenv/config';
import { db } from '../index';
import { user, account } from '../schema';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';

async function main() {
    const email = 'rogerbeaudry@yahoo.com';
    const password = 'Gold4me.471@1761';
    const name = 'Admin User';
    
    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log(`🔐 Creating admin user with email: ${normalizedEmail}`);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, normalizedEmail))
        .limit(1);

    const userExists = existingUser.length > 0;
    let userId: string;
    let userResponse;

    if (userExists) {
        console.log('⚠️  User already exists. Updating to admin role...');
        // User exists - update role to admin and password
        userId = existingUser[0].id;
        
        // Update user role to admin
        const updatedUser = await db
            .update(user)
            .set({
                role: 'admin',
                name: name.trim(),
                emailVerified: true,
                updatedAt: new Date(),
            })
            .where(eq(user.id, userId))
            .returning();
        
        userResponse = updatedUser[0];
        console.log('✅ User role updated to admin');

        // Update or create account credentials
        const existingAccount = await db
            .select()
            .from(account)
            .where(
                and(
                    eq(account.userId, userId),
                    eq(account.providerId, 'credential')
                )
            )
            .limit(1);

        if (existingAccount.length > 0) {
            // Update existing account password
            await db
                .update(account)
                .set({
                    password: hashedPassword,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(account.userId, userId),
                        eq(account.providerId, 'credential')
                    )
                );
            console.log('✅ Account password updated');
        } else {
            // Create new account record
            const accountId = nanoid();
            await db.insert(account).values({
                id: accountId,
                accountId: normalizedEmail,
                providerId: 'credential',
                userId: userId,
                password: hashedPassword,
                accessToken: null,
                refreshToken: null,
                idToken: null,
                accessTokenExpiresAt: null,
                refreshTokenExpiresAt: null,
                scope: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('✅ Account credentials created');
        }
    } else {
        console.log('➕ Creating new admin user...');
        // User doesn't exist - create new user with admin role
        userId = nanoid();
        
        const newUser = await db
            .insert(user)
            .values({
                id: userId,
                name: name.trim(),
                email: normalizedEmail,
                emailVerified: true,
                role: 'admin',
                image: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        if (newUser.length === 0) {
            throw new Error('Failed to create user');
        }

        userResponse = newUser[0];
        console.log('✅ Admin user created');

        // Create account credentials
        const accountId = nanoid();
        await db.insert(account).values({
            id: accountId,
            accountId: normalizedEmail,
            providerId: 'credential',
            userId: userId,
            password: hashedPassword,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log('✅ Account credentials created');
    }
    
    console.log('\n🎉 Admin user setup completed successfully!');
    console.log(`📧 Email: ${userResponse.email}`);
    console.log(`👤 Name: ${userResponse.name}`);
    console.log(`🔑 Role: ${userResponse.role}`);
    console.log(`🆔 User ID: ${userResponse.id}`);
    console.log('\n💡 You can now login at /Cesworld/login or /cesworld/login');
}

main().catch((error) => {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
});

