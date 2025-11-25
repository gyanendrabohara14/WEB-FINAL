// routes/shop_products.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------------------------
// GET all shop products
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM shop_products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching shop products:', err);
        res.status(500).json({ error: 'Failed to fetch shop products' });
    }
});

// ---------------------------
// GET single shop product by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM shop_products WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// ---------------------------
// CREATE new shop product
// ---------------------------
router.post('/', async (req, res) => {
    const { name, description, price, image_url, thumbnail_url, category, stock_quantity, featured, active, sort_order } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO shop_products
            (name, description, price, image_url, thumbnail_url, category, stock_quantity, featured, active, sort_order)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [
                name, 
                description, 
                price, 
                image_url, 
                thumbnail_url, 
                category || 'prints', 
                stock_quantity || 0, 
                featured || false, 
                active !== undefined ? active : true, 
                sort_order || 0
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// ---------------------------
// UPDATE a shop product
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, image_url, thumbnail_url, category, stock_quantity, featured, active, sort_order } = req.body;
    try {
        const result = await pool.query(
            `UPDATE shop_products SET
            name=$1, description=$2, price=$3, image_url=$4, thumbnail_url=$5, category=$6,
            stock_quantity=$7, featured=$8, active=$9, sort_order=$10, updated_at=NOW()
            WHERE id=$11 RETURNING *`,
            [
                name, 
                description, 
                price, 
                image_url, 
                thumbnail_url, 
                category, 
                stock_quantity, 
                featured, 
                active, 
                sort_order, 
                id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// ---------------------------
// DELETE a shop product
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM shop_products WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully', deletedProduct: result.rows[0] });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
