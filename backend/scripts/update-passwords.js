const bcrypt = require('bcryptjs');
const { run, close } = require('../src/config/database');

const updatePasswords = async () => {
    console.log('🔐 Generating password hashes...\n');

    try {
        // Generate hashes
        const adminHash = await bcrypt.hash('admin123', 10);
        const clientHash = await bcrypt.hash('client123', 10);
        const pmHash = await bcrypt.hash('pm123', 10);
        const viewerHash = await bcrypt.hash('viewer123', 10);

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

        // Update PM user
        await run(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [pmHash, 'pm-001']
        );
        console.log('✅ Updated pm@flowsync.com');

        // Update Viewer user
        await run(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [viewerHash, 'viewer-001']
        );
        console.log('✅ Updated viewer@flowsync.com');

        console.log('\n🎉 All passwords updated successfully!');
        console.log('\nYou can now login with:');
        console.log('  Admin:   admin@flowsync.com / admin123');
        console.log('  Member:  john@client.com / client123');
        console.log('  Member:  sarah@client.com / client123');
        console.log('  PM:      pm@flowsync.com / pm123');
        console.log('  Viewer:  viewer@flowsync.com / viewer123');

        await close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await close();
        process.exit(1);
    }
};

updatePasswords();
