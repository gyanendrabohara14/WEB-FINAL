// routes/analytics.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------------------------
// GET all analytics records
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM analytics ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// ---------------------------
// GET single analytics record by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM analytics WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Analytics record not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching analytics record:', err);
        res.status(500).json({ error: 'Failed to fetch analytics record' });
    }
});

// ---------------------------
// CREATE new analytics record
// ---------------------------
router.post('/', async (req, res) => {
    const { page_name, visitor_count, date } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO analytics (page_name, visitor_count, date)
            VALUES ($1, $2, $3) RETURNING *`,
            [page_name, visitor_count || 0, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating analytics record:', err);
        res.status(500).json({ error: 'Failed to create analytics record' });
    }
});

// ---------------------------
// UPDATE an analytics record
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { page_name, visitor_count, date } = req.body;
    try {
        const result = await pool.query(
            `UPDATE analytics
             SET page_name=$1, visitor_count=$2, date=$3, created_at=NOW()
             WHERE id=$4 RETURNING *`,
            [page_name, visitor_count, date, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Analytics record not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating analytics record:', err);
        res.status(500).json({ error: 'Failed to update analytics record' });
    }
});

// ---------------------------
// DELETE an analytics record
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM analytics WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Analytics record not found' });
        res.json({ message: 'Analytics record deleted successfully', deletedRecord: result.rows[0] });
    } catch (err) {
        console.error('Error deleting analytics record:', err);
        res.status(500).json({ error: 'Failed to delete analytics record' });
    }
});

module.exports = router;
