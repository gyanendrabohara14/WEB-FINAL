const { Pool } = require('pg');
require('dotenv').config();

// 1. Configure the connection (Cloud vs Local)
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for Neon.tech
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'boundless_moment',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(connectionConfig);

// 2. Test the connection (This is the part you were looking for!)
pool.connect()
  .then(() => console.log('✅ Connected to Database'))
  .catch(err => console.error('❌ Database connection error:', err));

// 3. Export the pool so other files can use it
module.exports = pool;