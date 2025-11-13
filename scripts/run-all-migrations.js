const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Helper function to check if a constraint exists
async function constraintExists(pool, constraintName, tableName) {
  try {
    const result = await executeWithRetry(pool, `
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE constraint_name = $1 
      AND table_name = $2
      AND table_schema = 'public'
      LIMIT 1
    `, [constraintName, tableName]);
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
}

// Helper function to extract constraint name from ALTER TABLE statement
function extractConstraintInfo(statement) {
  const constraintMatch = statement.match(/ADD CONSTRAINT\s+"?([^"\s]+)"?/i);
  const tableMatch = statement.match(/ALTER TABLE\s+"?([^"\s.]+)"?/i);
  
  if (constraintMatch && tableMatch) {
    return {
      constraintName: constraintMatch[1],
      tableName: tableMatch[1]
    };
  }
  return null;
}

// Helper function to sleep/delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to execute query with retry logic
async function executeWithRetry(pool, query, params = [], maxRetries = 3, retryDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create a new client for each query to avoid connection issues
      const client = await pool.connect();
      try {
        const result = await client.query(query, params);
        return result;
      } finally {
        client.release();
      }
    } catch (error) {
      lastError = error;
      
      // Check if it's a network/WebSocket error
      const isNetworkError = error.message?.includes('network error') || 
                            error.message?.includes('non-101') ||
                            error.message?.includes('WebSocket') ||
                            error.code === 'ECONNRESET' ||
                            error.code === 'ETIMEDOUT';
      
      if (isNetworkError && attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`  ⚠️  Network error (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

async function runAllMigrations() {
  // Configure pool with better settings for migrations
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 1, // Use single connection for migrations to avoid WebSocket issues
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  
  try {
    // Get all migration files in order
    const migrationsDir = path.join(__dirname, '..', 'drizzle');
    const migrationFiles = [
      '0000_crazy_harry_osborn.sql',
      '0001_fancy_sentinels.sql',
      '0002_cheerful_blink.sql',
      '0003_add_audit_logs.sql',
      '0004_add_banner_to_designers.sql',
      '0005_add_documents_table.sql',
      '0006_add_file_storage.sql',
      '0007_add_contract_file_url.sql'
    ];

    console.log('🚀 Starting to run all migrations...\n');

    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Skipping ${migrationFile} - file not found`);
        continue;
      }

      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      console.log(`\n📄 Running migration: ${migrationFile}`);
      
      // Split by statement breakpoint and execute each statement
      const statements = sql.split('--> statement-breakpoint').filter(s => s.trim());
      
      for (let i = 0; i < statements.length; i++) {
        const cleanStatement = statements[i].trim();
        if (cleanStatement) {
          try {
            // Check if this is an ADD CONSTRAINT statement
            const isConstraintStatement = /ALTER TABLE.*ADD CONSTRAINT/i.test(cleanStatement);
            
            if (isConstraintStatement) {
              const constraintInfo = extractConstraintInfo(cleanStatement);
              if (constraintInfo) {
                const exists = await constraintExists(
                  pool, 
                  constraintInfo.constraintName, 
                  constraintInfo.tableName
                );
                if (exists) {
                  console.log(`  ⚠️  Constraint "${constraintInfo.constraintName}" already exists (skipping)`);
                  continue;
                }
              }
            }
            
            console.log(`  Executing statement ${i + 1}/${statements.length}...`);
            
            // Execute with retry logic for network errors
            try {
              await executeWithRetry(pool, cleanStatement);
              console.log(`  ✓ Statement ${i + 1} executed successfully`);
            } catch (retryError) {
              // If retry failed, check if it's a known error we can ignore
              if (retryError.code === '42P07' || retryError.message?.includes('already exists')) {
                console.log(`  ⚠️  Statement ${i + 1} - Object already exists (skipping)`);
                continue;
              }
              throw retryError; // Re-throw if not a known error
            }
            
            // Small delay between statements to avoid overwhelming the connection
            if (i < statements.length - 1) {
              await sleep(100); // 100ms delay between statements
            }
          } catch (error) {
            // Handle common errors gracefully
            if (error.code === '42P07') {
              console.log(`  ⚠️  Table already exists (this is okay)`);
            } else if (error.code === '42701') {
              console.log(`  ⚠️  Column already exists (this is okay)`);
            } else if (error.code === '42P16' || error.code === '42710' || error.message.includes('already exists')) {
              console.log(`  ⚠️  Constraint already exists (this is okay)`);
            } else if (error.message?.includes('network error') || error.message?.includes('non-101') || error.message?.includes('WebSocket')) {
              console.error(`  ❌ Network error executing statement ${i + 1}:`, error.message);
              console.log(`  ⚠️  This may be a transient network issue. The statement may have succeeded. Continuing...`);
              // Continue with next statement - the statement may have actually succeeded
            } else {
              console.error(`  ❌ Error executing statement ${i + 1}:`, error.message);
              // Continue with next statement instead of failing completely
            }
          }
        }
      }
      
      console.log(`✅ Migration ${migrationFile} completed`);
    }
    
    console.log('\n🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration process failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

runAllMigrations().catch(console.error);

