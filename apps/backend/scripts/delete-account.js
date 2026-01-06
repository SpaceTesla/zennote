#!/usr/bin/env node

/**
 * Script to completely delete a user account by email
 * 
 * This script will:
 * 1. Find the user by email in the database
 * 2. Delete the user from Clerk
 * 3. Delete all related data from the database (notes, profiles, settings, etc.)
 * 
 * Usage:
 *   npm run delete-account <email>
 *   or
 *   node scripts/delete-account.js <email> [--remote|--local]
 * 
 * Environment variables required:
 *   - CLERK_SECRET_KEY: Clerk secret key for API access
 * 
 * Database:
 *   - Uses wrangler d1 execute to interact with D1 database
 *   - Defaults to remote database, use --local for local
 */

const { execSync } = require('child_process');
const { createClerkClient } = require('@clerk/backend');
const readline = require('readline');

const DATABASE_NAME = 'zennote-d1';

function getClerkSecretKey() {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) {
    console.error('❌ Error: CLERK_SECRET_KEY environment variable is required');
    console.error('   Set it in your .env file or export it before running the script');
    process.exit(1);
  }
  return key;
}

function executeSQL(sql, isLocal = false) {
  const flag = isLocal ? '--local' : '--remote';
  try {
    const result = execSync(
      `wrangler d1 execute ${DATABASE_NAME} ${flag} --command "${sql.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return result;
  } catch (error) {
    const errorMessage = error.message || String(error);
    throw new Error(`SQL execution failed: ${errorMessage}`);
  }
}

function querySQL(sql, isLocal = false) {
  const flag = isLocal ? '--local' : '--remote';
  try {
    // Try with --json flag first (if supported)
    let result;
    try {
      result = execSync(
        `wrangler d1 execute ${DATABASE_NAME} ${flag} --json --command "${sql.replace(/"/g, '\\"')}"`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );
    } catch {
      // Fallback to regular command if --json not supported
      result = execSync(
        `wrangler d1 execute ${DATABASE_NAME} ${flag} --command "${sql.replace(/"/g, '\\"')}"`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );
    }
    
    try {
      const parsed = JSON.parse(result);
      // Wrangler returns results in different formats, try to extract the data
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (parsed.results && Array.isArray(parsed.results)) {
        return parsed.results;
      }
      if (parsed[0] && Array.isArray(parsed[0].results)) {
        return parsed[0].results;
      }
      return [];
    } catch {
      // If JSON parsing fails, try to extract from text output
      const lines = result.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            continue;
          }
        }
      }
      return [];
    }
  } catch (error) {
    const errorMessage = error.message || String(error);
    throw new Error(`SQL query failed: ${errorMessage}`);
  }
}

async function findUserByEmail(email, isLocal) {
  const safeEmail = email.replace(/'/g, "''");
  const sql = `SELECT id, clerk_user_id, email FROM users WHERE email = '${safeEmail}'`;
  const results = querySQL(sql, isLocal);
  
  if (results && results.length > 0) {
    const user = results[0];
    // Handle different possible result formats
    return {
      id: user.id || user.id,
      clerk_user_id: user.clerk_user_id || user.clerk_user_id,
      email: user.email || user.email,
    };
  }
  
  return null;
}

async function getDeletionStats(userId, isLocal) {
  const stats = {
    notesDeleted: 0,
    profilesDeleted: 0,
    settingsDeleted: 0,
    accessRecordsDeleted: 0,
    viewsDeleted: 0,
    deletionsDeleted: 0,
    auditLogsDeleted: 0,
  };

  const safeUserId = userId.replace(/'/g, "''");

  // Count notes owned by user
  const notesResult = querySQL(
    `SELECT COUNT(*) FROM notes WHERE owner_id = '${safeUserId}'`,
    isLocal
  );
  stats.notesDeleted = notesResult[0]?.['COUNT(*)'] || 0;

  // Count profiles
  const profilesResult = querySQL(
    `SELECT COUNT(*) FROM user_profiles WHERE user_id = '${safeUserId}'`,
    isLocal
  );
  stats.profilesDeleted = profilesResult[0]?.['COUNT(*)'] || 0;

  // Count settings
  const settingsResult = querySQL(
    `SELECT COUNT(*) FROM user_settings WHERE user_id = '${safeUserId}'`,
    isLocal
  );
  stats.settingsDeleted = settingsResult[0]?.['COUNT(*)'] || 0;

  // Count access records
  const accessResult = querySQL(
    `SELECT COUNT(*) FROM note_access WHERE user_id = '${safeUserId}'`,
    isLocal
  );
  stats.accessRecordsDeleted = accessResult[0]?.['COUNT(*)'] || 0;

  // Count views
  const viewsResult = querySQL(
    `SELECT COUNT(*) FROM note_views WHERE viewer_user_id = '${safeUserId}'`,
    isLocal
  );
  stats.viewsDeleted = viewsResult[0]?.['COUNT(*)'] || 0;

  // Count deletions
  const deletionsResult = querySQL(
    `SELECT COUNT(*) FROM note_deletions WHERE deleted_by = '${safeUserId}'`,
    isLocal
  );
  stats.deletionsDeleted = deletionsResult[0]?.['COUNT(*)'] || 0;

  // Count audit logs
  const auditResult = querySQL(
    `SELECT COUNT(*) FROM audit_logs WHERE user_id = '${safeUserId}'`,
    isLocal
  );
  stats.auditLogsDeleted = auditResult[0]?.['COUNT(*)'] || 0;

  return stats;
}

async function deleteUserFromClerk(clerkUserId) {
  try {
    const clerkSecretKey = getClerkSecretKey();
    const clerkClient = createClerkClient({ secretKey: clerkSecretKey });
    
    console.log(`   Deleting user from Clerk (ID: ${clerkUserId})...`);
    await clerkClient.users.deleteUser(clerkUserId);
    console.log('   ✅ User deleted from Clerk');
    return true;
  } catch (error) {
    const errorMessage = error.message || String(error);
    // If user doesn't exist in Clerk, that's okay - they might have been deleted already
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      console.log('   ⚠️  User not found in Clerk (may have been deleted already)');
      return true;
    }
    console.error(`   ❌ Failed to delete user from Clerk: ${errorMessage}`);
    return false;
  }
}

async function deleteUserFromDatabase(userId, isLocal) {
  // Delete user - this will cascade delete:
  // - user_profiles (ON DELETE CASCADE)
  // - user_settings (ON DELETE CASCADE)
  // - note_access (ON DELETE CASCADE)
  // And set to NULL:
  // - notes.owner_id (ON DELETE SET NULL)
  // - notes.slug_owner_id (ON DELETE SET NULL)
  // - note_views.viewer_user_id (ON DELETE SET NULL)
  // - note_deletions.deleted_by (ON DELETE SET NULL)
  // - audit_logs.user_id (ON DELETE SET NULL)

  console.log('   Deleting user from database...');
  
  const safeUserId = userId.replace(/'/g, "''");
  
  // First, manually delete note_access records to ensure they're gone
  executeSQL(
    `DELETE FROM note_access WHERE user_id = '${safeUserId}'`,
    isLocal
  );

  // Delete audit logs
  executeSQL(
    `DELETE FROM audit_logs WHERE user_id = '${safeUserId}'`,
    isLocal
  );

  // Delete note views
  executeSQL(
    `DELETE FROM note_views WHERE viewer_user_id = '${safeUserId}'`,
    isLocal
  );

  // Delete note deletions
  executeSQL(
    `DELETE FROM note_deletions WHERE deleted_by = '${safeUserId}'`,
    isLocal
  );

  // Delete notes owned by user (before deleting user to avoid foreign key issues)
  executeSQL(
    `DELETE FROM notes WHERE owner_id = '${safeUserId}'`,
    isLocal
  );

  // Delete notes where user is slug_owner
  executeSQL(
    `DELETE FROM notes WHERE slug_owner_id = '${safeUserId}'`,
    isLocal
  );

  // Finally, delete the user (cascades will handle profiles and settings)
  executeSQL(
    `DELETE FROM users WHERE id = '${safeUserId}'`,
    isLocal
  );

  console.log('   ✅ User deleted from database');
}

function askConfirmation(email, user, stats) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n⚠️  WARNING: This will permanently delete the account and all associated data!');
    console.log('\n📋 Deletion Summary:');
    console.log(`   Email: ${email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Clerk User ID: ${user.clerk_user_id}`);
    console.log(`   Notes: ${stats.notesDeleted}`);
    console.log(`   Profile: ${stats.profilesDeleted}`);
    console.log(`   Settings: ${stats.settingsDeleted}`);
    console.log(`   Access Records: ${stats.accessRecordsDeleted}`);
    console.log(`   Views: ${stats.viewsDeleted}`);
    console.log(`   Deletions: ${stats.deletionsDeleted}`);
    console.log(`   Audit Logs: ${stats.auditLogsDeleted}`);

    rl.question('\n❓ Are you sure you want to proceed? Type "DELETE" to confirm: ', (answer) => {
      rl.close();
      resolve(answer.trim() === 'DELETE');
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args.find(arg => !arg.startsWith('--'));
  const isLocal = args.includes('--local');
  const isRemote = args.includes('--remote');

  if (!emailArg) {
    console.error('❌ Error: Email address is required');
    console.error('\nUsage:');
    console.error('  npm run delete-account <email> [--local|--remote]');
    console.error('\nExample:');
    console.error('  npm run delete-account user@example.com');
    console.error('  npm run delete-account user@example.com --local');
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const dbMode = isLocal ? 'local' : 'remote';

  console.log(`\n🔍 Searching for user with email: ${email}`);
  console.log(`📦 Database mode: ${dbMode}\n`);

  try {
    // Find user in database
    const user = await findUserByEmail(email, isLocal);
    
    if (!user) {
      console.error(`❌ User with email "${email}" not found in database`);
      process.exit(1);
    }

    console.log(`✅ User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Clerk User ID: ${user.clerk_user_id}`);
    console.log(`   Email: ${user.email}`);

    // Get deletion stats
    console.log('\n📊 Gathering deletion statistics...');
    const stats = await getDeletionStats(user.id, isLocal);

    // Ask for confirmation
    const confirmed = await askConfirmation(email, user, stats);
    
    if (!confirmed) {
      console.log('\n❌ Deletion cancelled');
      process.exit(0);
    }

    console.log('\n🗑️  Starting deletion process...\n');

    // Delete from Clerk
    const clerkDeleted = await deleteUserFromClerk(user.clerk_user_id);
    
    if (!clerkDeleted) {
      console.error('\n❌ Failed to delete from Clerk. Aborting database deletion.');
      process.exit(1);
    }

    // Delete from database
    await deleteUserFromDatabase(user.id, isLocal);

    console.log('\n✅ Account deletion completed successfully!');
    console.log('   All user data has been removed from both Clerk and the database.');

  } catch (error) {
    console.error('\n❌ Error during deletion:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

main();




