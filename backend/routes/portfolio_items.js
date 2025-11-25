// routes/portfolio_items.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------------------------
// GET all portfolio items
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM portfolio_items ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching portfolio items:', err);
        res.status(500).json({ error: 'Failed to fetch portfolio items' });
    }
});

// ---------------------------
// GET single portfolio item by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM portfolio_items WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Portfolio item not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching portfolio item:', err);
        res.status(500).json({ error: 'Failed to fetch portfolio item' });
    }
});

// ---------------------------
// CREATE new portfolio item
// ---------------------------
router.post('/', async (req, res) => {
    const { title, description, category, image_url, thumbnail_url, featured, sort_order } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO portfolio_items
            (title, description, category, image_url, thumbnail_url, featured, sort_order)
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [title, description, category, image_url, thumbnail_url, featured || false, sort_order || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating portfolio item:', err);
        res.status(500).json({ error: 'Failed to create portfolio item' });
    }
});

// ---------------------------
// UPDATE a portfolio item
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, category, image_url, thumbnail_url, featured, sort_order } = req.body;
    try {
        const result = await pool.query(
            `UPDATE portfolio_items SET
            title=$1, description=$2, category=$3, image_url=$4, thumbnail_url=$5,
            featured=$6, sort_order=$7, updated_at=NOW()
            WHERE id=$8 RETURNING *`,
            [title, description, category, image_url, thumbnail_url, featured, sort_order, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Portfolio item not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating portfolio item:', err);
        res.status(500).json({ error: 'Failed to update portfolio item' });
    }
});

// ---------------------------
// DELETE a portfolio item
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM portfolio_items WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Portfolio item not found' });
        res.json({ message: 'Portfolio item deleted successfully', deletedItem: result.rows[0] });
    } catch (err) {
        console.error('Error deleting portfolio item:', err);
        res.status(500).json({ error: 'Failed to delete portfolio item' });
    }
});

module.exports = router;
