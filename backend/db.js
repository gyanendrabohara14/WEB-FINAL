// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

// If we are in production (Render), use the DATABASE_URL.
// If we are on localhost, use the separate variables.
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for Neon.tech
      }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'boundless_moment',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(connectionConfig);

pool.connect()
  .then(() => console.log('✅ Connected to Database'))
  .catch(err => console.error('❌ Database connection error:', err));

module.exports = pool;