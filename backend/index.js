// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ---------------------------
// MIDDLEWARE
// ---------------------------
app.use(cors());
app.use(express.json());

// ---------------------------
// DATABASE
// ---------------------------
const pool = require('./db');
app.locals.pool = pool;

// ---------------------------
// ROUTES
// ---------------------------
const usersRoutes = require('./routes/users');
const inquiriesRoutes = require('./routes/inquiries');
const bookingsRoutes = require('./routes/bookings');
const portfolioRoutes = require('./routes/portfolio_items');
const galleryRoutes = require('./routes/gallery_images');
const testimonialsRoutes = require('./routes/testimonials');
const productsRoutes = require('./routes/shop_products');
const ordersRoutes = require('./routes/orders');
const orderItemsRoutes = require('./routes/order_items');

// Attach routes to paths
app.use('/api/users', usersRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/order-items', orderItemsRoutes);

// ---------------------------
// HEALTH CHECK
// ---------------------------
app.get('/', (req, res) => res.send('API is running ✅'));

// ---------------------------
// 404 HANDLER
// ---------------------------
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ---------------------------
// ERROR HANDLING MIDDLEWARE
// ---------------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));