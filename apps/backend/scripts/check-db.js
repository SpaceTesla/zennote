#!/usr/bin/env node

/**
 * Quick script to check if D1 database exists and provide setup instructions
 * Run: node scripts/check-db.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const wranglerTomlPath = path.join(__dirname, '..', 'wrangler.toml');

function readWranglerConfig() {
  const content = fs.readFileSync(wranglerTomlPath, 'utf-8');
  const dbIdMatch = content.match(/database_id\s*=\s*"([^"]+)"/);
  const dbNameMatch = content.match(/database_name\s*=\s*"([^"]+)"/);
  
  return {
    databaseId: dbIdMatch ? dbIdMatch[1] : null,
    databaseName: dbNameMatch ? dbNameMatch[1] : null,
  };
}

function checkDatabase() {
  try {
    console.log('Checking D1 databases...\n');
    const output = execSync('wrangler d1 list', { encoding: 'utf-8' });
    console.log(output);
    
    const config = readWranglerConfig();
    if (config.databaseId && config.databaseName) {
      console.log(`\n📋 Current config in wrangler.toml:`);
      console.log(`   Database Name: ${config.databaseName}`);
      console.log(`   Database ID: ${config.databaseId}\n`);
      
      if (output.includes(config.databaseId)) {
        console.log('✅ Database ID found in your account!');
      } else {
        console.log('⚠️  Database ID in wrangler.toml not found in your account.');
        console.log('   You may need to:');
        console.log('   1. Create a new database: npm run db:create');
        console.log('   2. Update database_id in wrangler.toml');
        console.log('   3. Run migrations: npm run db:migrate');
      }
    }
  } catch (error) {
    console.error('❌ Error checking databases:', error.message);
    console.log('\n💡 Make sure you are logged in: wrangler login');
  }
}

checkDatabase();

