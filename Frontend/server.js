// Import dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize app
const app = express();

// Change frontend port to avoid conflict with backend (backend = 3000)
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Default route (Home page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Home.html'));
});

// Admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'Admin.html'));
});

// Example API route (testing purpose)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Frontend server API is working fine!' });
});

// Dynamic page routes
app.get('/:page', (req, res) => {
  const page = req.params.page.toLowerCase();
  const validPages = [
    'home', 'about', 'portfolio', 'gallery', 'services',
    'skills', 'testimonials', 'contact', 'booking', 'shop'
  ];

  if (validPages.includes(page)) {
    const fileName = page.charAt(0).toUpperCase() + page.slice(1) + '.html';
    res.sendFile(path.join(__dirname, fileName));
  } else {
    res.status(404).send('<h2>404 Page Not Found</h2>');
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).send('Internal Server Error');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Frontend server running on http://localhost:${PORT}`);
  console.log(`🛠  Admin panel: http://localhost:${PORT}/admin`);
});
