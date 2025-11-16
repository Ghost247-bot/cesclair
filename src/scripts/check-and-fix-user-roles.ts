import 'dotenv/config';
import { db } from '@/db';
import { user } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

/**
 * Script to check and fix all user roles in the database
 * - Fetches all users
 * - Checks for null or invalid roles
 * - Fixes roles that are missing or invalid
 * - Sets default role 'member' for users without roles
 */
async function checkAndFixUserRoles() {
  try {
    console.log('🔍 Fetching all users from database...');
    
    // Fetch all users with their roles
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .orderBy(user.createdAt);

    console.log(`\n📊 Total users found: ${users.length}\n`);

    if (users.length === 0) {
      console.log('✅ No users found in database.');
      return;
    }

    // Valid roles
    const validRoles = ['member', 'designer', 'admin'];
    
    // Track issues
    const issues: Array<{
      userId: string;
      email: string;
      currentRole: string | null;
      issue: string;
      fixed: boolean;
      newRole?: string;
    }> = [];

    // Check each user
    for (const userData of users) {
      const currentRole = userData.role;
      let hasIssue = false;
      let issueDescription = '';
      let newRole: string | undefined;

      // Check for null or empty role
      if (!currentRole || currentRole.trim() === '') {
        hasIssue = true;
        issueDescription = 'Role is null or empty';
        newRole = 'member'; // Default role
      }
      // Check for invalid role
      else if (!validRoles.includes(currentRole)) {
        hasIssue = true;
        issueDescription = `Invalid role: "${currentRole}" (must be one of: ${validRoles.join(', ')})`;
        newRole = 'member'; // Default to member for invalid roles
      }

      if (hasIssue) {
        issues.push({
          userId: userData.id,
          email: userData.email,
          currentRole: currentRole || null,
          issue: issueDescription,
          fixed: false,
          newRole,
        });
      }
    }

    // Display results
    console.log('📋 User Role Analysis:');
    console.log('─'.repeat(80));
    console.log(`${'Email'.padEnd(40)} | ${'Current Role'.padEnd(15)} | Status`);
    console.log('─'.repeat(80));

    users.forEach((u) => {
      const roleStatus = !u.role || !validRoles.includes(u.role) ? '❌ ISSUE' : '✅ OK';
      const displayRole = u.role || '(null)';
      console.log(`${u.email.padEnd(40)} | ${displayRole.padEnd(15)} | ${roleStatus}`);
    });

    // Display issues if any
    if (issues.length > 0) {
      console.log('\n⚠️  Issues Found:');
      console.log('─'.repeat(80));
      issues.forEach((issue) => {
        console.log(`\nUser ID: ${issue.userId}`);
        console.log(`Email: ${issue.email}`);
        console.log(`Current Role: ${issue.currentRole || '(null)'}`);
        console.log(`Issue: ${issue.issue}`);
        console.log(`Proposed Fix: Set role to "${issue.newRole}"`);
      });

      console.log(`\n\n🔧 Fixing ${issues.length} user(s)...\n`);

      // Fix issues
      let fixedCount = 0;
      for (const issue of issues) {
        try {
          await db
            .update(user)
            .set({
              role: issue.newRole || 'member',
              updatedAt: sql`now()`,
            })
            .where(eq(user.id, issue.userId));

          issue.fixed = true;
          fixedCount++;
          console.log(`✅ Fixed user ${issue.email}: ${issue.currentRole || '(null)'} → ${issue.newRole}`);
        } catch (error) {
          console.error(`❌ Failed to fix user ${issue.email}:`, error);
        }
      }

      console.log(`\n✅ Successfully fixed ${fixedCount} out of ${issues.length} user(s).`);
    } else {
      console.log('\n✅ All users have valid roles! No fixes needed.');
    }

    // Summary by role
    console.log('\n📊 Summary by Role:');
    console.log('─'.repeat(40));
    const roleCounts: Record<string, number> = {};
    users.forEach((u) => {
      const role = u.role || 'null';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    // Add fixed users to counts
    issues.forEach((issue) => {
      if (issue.fixed && issue.newRole) {
        const oldRole = issue.currentRole || 'null';
        if (roleCounts[oldRole]) {
          roleCounts[oldRole]--;
          if (roleCounts[oldRole] === 0) delete roleCounts[oldRole];
        }
        roleCounts[issue.newRole] = (roleCounts[issue.newRole] || 0) + 1;
      }
    });

    Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([role, count]) => {
        console.log(`${role.padEnd(15)} : ${count}`);
      });

    console.log('\n✅ Check and fix completed successfully!');
  } catch (error) {
    console.error('❌ Error checking/fixing user roles:', error);
    throw error;
  }
}

// Run the script
checkAndFixUserRoles()
  .then(() => {
    console.log('\n✨ Script execution completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script execution failed:', error);
    process.exit(1);
  });

