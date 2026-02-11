const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

const runMigration = async () => {
    console.log('🚀 Starting database migration...\n');

    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Reading migration file: 001_initial_schema.sql');

        // Execute the migration
        console.log('⚙️  Executing migration...\n');
        await pool.query(migrationSQL);

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

        console.log('\n🌱 Seed data created:');
        console.log('   - Admin user: admin@flowsync.com (password: admin123)');
        console.log('   - Client users: john@client.com, sarah@client.com (password: client123)');
        console.log('   - Default project: FlowSync Core (FLOW)');

        console.log('\n⚠️  IMPORTANT: Change default passwords in production!');

        // Close the pool
        await pool.end();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nFull error:', error);

        await pool.end();
        process.exit(1);
    }
};

// Run the migration
runMigration();
