const fs = require('fs');
const path = require('path');
const { db, close } = require('../src/config/database');

const runMigration = async () => {
    console.log('🚀 Starting SQLite database migration...\n');

    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Reading migration file: 001_initial_schema.sql');
        console.log('⚙️  Executing migration...\n');

        // Execute the entire SQL file at once
        // SQLite's exec() method can handle multiple statements
        await new Promise((resolve, reject) => {
            db.exec(migrationSQL, (err) => {
                if (err) {
                    console.error('❌ Migration error:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        console.log('✅ Migration completed successfully!\n');
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
