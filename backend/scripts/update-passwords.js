const bcrypt = require('bcryptjs');
const { run, close } = require('../src/config/database');

const updatePasswords = async () => {
    console.log('🔐 Generating password hashes...\n');

    try {
        // Generate hashes
        const adminHash = await bcrypt.hash('admin123', 10);
        const clientHash = await bcrypt.hash('client123', 10);

        console.log('✅ Password hashes generated\n');
        console.log('📝 Updating users in database...\n');

        // Update admin user
        await run(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [adminHash, 'admin-001']
        );
        console.log('✅ Updated admin@flowsync.com');

        // Update client users
        await run(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [clientHash, 'client-001']
        );
        console.log('✅ Updated john@client.com');

        await run(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [clientHash, 'client-002']
        );
        console.log('✅ Updated sarah@client.com');

        console.log('\n🎉 All passwords updated successfully!');
        console.log('\nYou can now login with:');
        console.log('  Admin: admin@flowsync.com / admin123');
        console.log('  Client: john@client.com / client123');
        console.log('  Client: sarah@client.com / client123');

        await close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await close();
        process.exit(1);
    }
};

updatePasswords();
