const fs = require('fs');
const path = require('path');
const { db, close, get } = require('../src/config/database');

const runMigration = async () => {
    console.log('🚀 Starting SQLite database migration...\n');

    try {
        const migrationsDir = path.join(__dirname, '../migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter((file) => file.endsWith('.sql'))
            .sort();

        console.log('📄 Found migration files:', files.join(', '));

        for (const file of files) {
            // Skip migration 002 if users table already has the correct schema
            if (file.includes('002_update_user_roles')) {
                try {
                    const row = await get("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
                    if (row && row.sql && row.sql.includes("'ADMIN'")) {
                        console.log(`\n⏭️  Skipping ${file} (users table already has correct roles)`);
                        continue;
                    }
                } catch (e) {
                    // Table doesn't exist yet, run the migration
                }
            }

            const migrationPath = path.join(migrationsDir, file);
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

            console.log(`\n📄 Reading migration file: ${file}`);
            console.log('⚙️  Executing migration...\n');

            await new Promise((resolve, reject) => {
                db.exec(migrationSQL, (err) => {
                    if (err) {
                        console.error('❌ Migration error in', file + ':', err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        console.log('\n✅ All migrations completed successfully!\n');
        console.log('📊 Created tables:');
        console.log('   - users');
        console.log('   - projects');
        console.log('   - sprints');
        console.log('   - issues');
        console.log('   - review_history');
        console.log('   - comments');
        console.log('   - issue_links');
        console.log('   - attachments');
        console.log('   - activity_log');
        console.log('   - notifications');

        console.log('\n📑 Created indexes (11 total)');
        console.log('📌 Created triggers (4 auto-update triggers)');

        console.log('\n🌱 Seed data created:');
        console.log('   - Admin user: admin@flowsync.com (password: admin123)');
        console.log('   - Client users: john@client.com, sarah@client.com (password: client123)');
        console.log('   - Default project: FlowSync Core (FLOW)');

        console.log('\n💾 Database file: ./data/flowsync.db');
        console.log('⚠️  IMPORTANT: Change default passwords in production!');

        // Close the database
        await close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nFull error:', error);

        await close();
        process.exit(1);
    }
};

// Run the migration
runMigration();

