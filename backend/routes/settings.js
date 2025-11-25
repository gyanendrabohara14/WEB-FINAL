// routes/settings.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------------------------
// GET all settings
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM settings ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// ---------------------------
// GET single setting by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM settings WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Setting not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching setting:', err);
        res.status(500).json({ error: 'Failed to fetch setting' });
    }
});

// ---------------------------
// CREATE new setting
// ---------------------------
router.post('/', async (req, res) => {
    const { setting_key, setting_value, setting_type, description } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO settings (setting_key, setting_value, setting_type, description)
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [setting_key, setting_value, setting_type || 'text', description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating setting:', err);
        res.status(500).json({ error: 'Failed to create setting' });
    }
});

// ---------------------------
// UPDATE a setting
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { setting_key, setting_value, setting_type, description } = req.body;
    try {
        const result = await pool.query(
            `UPDATE settings SET
            setting_key=$1, setting_value=$2, setting_type=$3, description=$4, updated_at=NOW()
            WHERE id=$5 RETURNING *`,
            [setting_key, setting_value, setting_type, description, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Setting not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating setting:', err);
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

// ---------------------------
// DELETE a setting
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM settings WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Setting not found' });
        res.json({ message: 'Setting deleted successfully', deletedSetting: result.rows[0] });
    } catch (err) {
        console.error('Error deleting setting:', err);
        res.status(500).json({ error: 'Failed to delete setting' });
    }
});

module.exports = router;
