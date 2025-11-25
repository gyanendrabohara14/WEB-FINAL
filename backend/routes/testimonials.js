// routes/testimonials.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------------------------
// GET all testimonials
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM testimonials ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching testimonials:', err);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// ---------------------------
// GET single testimonial by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM testimonials WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Testimonial not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching testimonial:', err);
        res.status(500).json({ error: 'Failed to fetch testimonial' });
    }
});

// ---------------------------
// CREATE new testimonial
// ---------------------------
router.post('/', async (req, res) => {
    const { client_name, client_image, rating, testimonial_text, service_type, featured, sort_order } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO testimonials
            (client_name, client_image, rating, testimonial_text, service_type, featured, sort_order)
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [client_name, client_image, rating, testimonial_text, service_type, featured || false, sort_order || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating testimonial:', err);
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
});

// ---------------------------
// UPDATE a testimonial
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { client_name, client_image, rating, testimonial_text, service_type, featured, sort_order } = req.body;
    try {
        const result = await pool.query(
            `UPDATE testimonials SET
            client_name=$1, client_image=$2, rating=$3, testimonial_text=$4, service_type=$5,
            featured=$6, sort_order=$7, updated_at=NOW()
            WHERE id=$8 RETURNING *`,
            [client_name, client_image, rating, testimonial_text, service_type, featured, sort_order, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Testimonial not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating testimonial:', err);
        res.status(500).json({ error: 'Failed to update testimonial' });
    }
});

// ---------------------------
// DELETE a testimonial
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM testimonials WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Testimonial not found' });
        res.json({ message: 'Testimonial deleted successfully', deletedTestimonial: result.rows[0] });
    } catch (err) {
        console.error('Error deleting testimonial:', err);
        res.status(500).json({ error: 'Failed to delete testimonial' });
    }
});

module.exports = router;
