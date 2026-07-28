const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDatabase() {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('🔄 Initializing database...');

        // Drop tables if they exist (to reset schema)
        await pool.query('DROP TABLE IF EXISTS investments CASCADE');
        await pool.query('DROP TABLE IF EXISTS projects CASCADE');
        await pool.query('DROP TABLE IF EXISTS users CASCADE');

        // Read schema file (without user insert)
        const schemaPath = path.join(__dirname, 'schema.sql');
        let schema = fs.readFileSync(schemaPath, 'utf8');

        // Remove the test user insert from schema (we'll do it manually with hashed password)
        schema = schema.replace(
            /INSERT INTO users.*?\nON CONFLICT \(email\) DO NOTHING;/,
            ''
        );

        // Execute schema
        await pool.query(schema);

        // Hash and insert test user with admin role
        const hashedPassword = await bcrypt.hash('1234', 10);
        await pool.query(
            'INSERT INTO users (email, password, name, role, verified) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
            ['test@test.com', hashedPassword, 'Admin User', 'admin', true]
        );

        console.log('✅ Database initialized successfully!');
        console.log('📊 Tables created: users, projects, investments');
        console.log('👤 Test admin: test@test.com / password: 1234 (role: admin)');
        console.log('📋 Schema includes role-based access control');

    } catch (error) {
        console.error('❌ Database initialization error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run initialization
initializeDatabase();
