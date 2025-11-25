// Configuration file for Boundless Moments
module.exports = {
    // Server Configuration
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Database Configuration (PostgreSQL)
    DATABASE: {
        HOST: process.env.DB_HOST || 'localhost',
        PORT: process.env.DB_PORT || 5432,
        NAME: process.env.DB_NAME || 'boundless_moments',
        USER: process.env.DB_USER || 'your_username',
        PASSWORD: process.env.DB_PASSWORD || 'your_password'
    },
    
    // JWT Secret
    JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
    
    // Admin Credentials (for demo)
    ADMIN: {
        USERNAME: process.env.ADMIN_USERNAME || 'admin',
        PASSWORD: process.env.ADMIN_PASSWORD || 'boundless123'
    }
};
