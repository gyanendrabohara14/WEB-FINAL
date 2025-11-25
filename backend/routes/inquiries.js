// routes/inquiries.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // use the shared pool from db.js

// ---------------------------
// GET all inquiries
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inquiries ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching inquiries:', err);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});

// ---------------------------
// GET single inquiry by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM inquiries WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching inquiry:', err);
        res.status(500).json({ error: 'Failed to fetch inquiry' });
    }
});

// ---------------------------
// CREATE new inquiry
// ---------------------------
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body; // include subject
    try {
        const result = await pool.query(
            'INSERT INTO inquiries (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, subject, message]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating inquiry:', err);
        res.status(500).json({ error: 'Failed to create inquiry' });
    }
});

// ---------------------------
// UPDATE an inquiry
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, subject, message, status } = req.body; // include subject & status
    try {
        const result = await pool.query(
            'UPDATE inquiries SET name=$1, email=$2, subject=$3, message=$4, status=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
            [name, email, subject, message, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating inquiry:', err);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
});

// ---------------------------
// DELETE an inquiry
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM inquiries WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        res.json({ message: 'Inquiry deleted successfully', deletedInquiry: result.rows[0] });
    } catch (err) {
        console.error('Error deleting inquiry:', err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
});

module.exports = router;
