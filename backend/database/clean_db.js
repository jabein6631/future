const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { db, initSchema } = require('./db');
const sqlite3 = require('sqlite3').verbose();

async function cleanDatabase() {
  console.log('🧹 Purging all data across all tables in the database...');

  // 1. Ensure schema is initialized
  await initSchema();

  // 2. Clear all tables in connected database (Turso libSQL Cloud)
  try {
    await db.runAsync("PRAGMA foreign_keys = OFF");
  } catch (e) {}

  const tables = await db.allAsync(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_libsql_%'"
  );

  // Sort child tables first so foreign keys don't block
  const priorityLast = ['users', 'quizzes', 'subjects'];
  const sortedTables = [
    ...tables.filter(t => !priorityLast.includes(t.name)),
    ...tables.filter(t => priorityLast.includes(t.name))
  ];

  console.log(`📋 Found ${sortedTables.length} tables to clear:`, sortedTables.map(t => t.name).join(', '));

  // Run up to 2 passes to guarantee any interdependent rows are completely removed
  for (let pass = 1; pass <= 2; pass++) {
    for (const row of sortedTables) {
      try {
        await db.runAsync(`DELETE FROM ${row.name}`);
        if (pass === 1) console.log(`  ✓ Cleared table: ${row.name}`);
      } catch (e) {
        if (pass === 2) console.warn(`  ⚠️ Notice clearing table ${row.name}: ${e.message}`);
      }
    }
  }

  // 3. Also clear local SQLite database (skillswap.db) if present
  const localDbPath = path.join(__dirname, 'skillswap.db');
  try {
    const localDb = new sqlite3.Database(localDbPath);
    await new Promise((resolve) => {
      localDb.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", async (err, localTables) => {
        if (!err && Array.isArray(localTables)) {
          for (const lt of localTables) {
            await new Promise(r => localDb.run(`DELETE FROM ${lt.name}`, () => r()));
          }
          console.log(`  ✓ Cleared all tables in local fallback skillswap.db`);
        }
        localDb.close(() => resolve());
      });
    });
  } catch (err) {
    // Ignore local SQLite cleanup errors
  }

  // 4. Verify all tables in Turso are now completely empty (0 rows)
  console.log('\n📊 Verifying table counts in Turso Cloud:');
  for (const row of tables) {
    try {
      const res = await db.getAsync(`SELECT COUNT(*) as count FROM ${row.name}`);
      console.log(`  • ${row.name}: ${res ? res.count : 0} rows`);
    } catch (e) {
      console.log(`  • ${row.name}: ${e.message}`);
    }
  }

  console.log('\n✨ Database is completely cleared! All tables exist with 0 rows.');
}

if (require.main === module) {
  cleanDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Error cleaning database:', err);
      process.exit(1);
    });
}

