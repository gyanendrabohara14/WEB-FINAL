const { Pool } = require('pg');
require('dotenv').config();

const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
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