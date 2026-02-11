const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'flowsync.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database:', dbPath);
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Enable WAL mode for better concurrency
db.run('PRAGMA journal_mode = WAL');

// Helper function to run queries with promises
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Database query error:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Helper function to run single query (INSERT, UPDATE, DELETE)
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                console.error('Database run error:', err);
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

// Helper function to get single row
const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Database get error:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Helper function for transactions
const transaction = async (callback) => {
    try {
        await run('BEGIN TRANSACTION');
        const result = await callback();
        await run('COMMIT');
        return result;
    } catch (error) {
        await run('ROLLBACK');
        throw error;
    }
};

// Close database connection
const close = () => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            } else {
                console.log('✅ Database connection closed');
                resolve();
            }
        });
    });
};

module.exports = {
    db,
    query,
    run,
    get,
    transaction,
    close,
};
