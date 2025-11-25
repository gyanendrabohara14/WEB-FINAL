// db.js
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Gyan',
  database: process.env.DB_NAME || 'boundless_moment',
  port: process.env.DB_PORT || 5432,
});

// Optional: Test connection when server starts
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch(err => console.error('❌ Database connection error:', err));

module.exports = pool;
