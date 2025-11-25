// routes/gallery_images.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------------------------
// GET all gallery images
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM gallery_images ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching gallery images:', err);
        res.status(500).json({ error: 'Failed to fetch gallery images' });
    }
});

// ---------------------------
// GET single gallery image by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM gallery_images WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Gallery image not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching gallery image:', err);
        res.status(500).json({ error: 'Failed to fetch gallery image' });
    }
});

// ---------------------------
// CREATE new gallery image
// ---------------------------
router.post('/', async (req, res) => {
    const { title, description, image_url, thumbnail_url, category, featured, sort_order } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO gallery_images
            (title, description, image_url, thumbnail_url, category, featured, sort_order)
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [title, description, image_url, thumbnail_url, category || 'general', featured || false, sort_order || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating gallery image:', err);
        res.status(500).json({ error: 'Failed to create gallery image' });
    }
});

// ---------------------------
// UPDATE a gallery image
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, thumbnail_url, category, featured, sort_order } = req.body;
    try {
        const result = await pool.query(
            `UPDATE gallery_images SET
            title=$1, description=$2, image_url=$3, thumbnail_url=$4,
            category=$5, featured=$6, sort_order=$7, updated_at=NOW()
            WHERE id=$8 RETURNING *`,
            [title, description, image_url, thumbnail_url, category, featured, sort_order, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Gallery image not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating gallery image:', err);
        res.status(500).json({ error: 'Failed to update gallery image' });
    }
});

// ---------------------------
// DELETE a gallery image
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM gallery_images WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Gallery image not found' });
        res.json({ message: 'Gallery image deleted successfully', deletedImage: result.rows[0] });
    } catch (err) {
        console.error('Error deleting gallery image:', err);
        res.status(500).json({ error: 'Failed to delete gallery image' });
    }
});

module.exports = router;
