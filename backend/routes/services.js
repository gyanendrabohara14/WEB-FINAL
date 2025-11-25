// routes/services.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------------------------
// GET all services
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// ---------------------------
// GET single service by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM services WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching service:', err);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

// ---------------------------
// CREATE new service
// ---------------------------
router.post('/', async (req, res) => {
    const { name, description, price, duration_hours, features, active, sort_order } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO services
            (name, description, price, duration_hours, features, active, sort_order)
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [
                name, 
                description || null, 
                price || 0, 
                duration_hours || null, 
                features ? JSON.stringify(features) : null, 
                active !== undefined ? active : true, 
                sort_order || 0
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating service:', err);
        res.status(500).json({ error: 'Failed to create service' });
    }
});

// ---------------------------
// UPDATE a service
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, duration_hours, features, active, sort_order } = req.body;
    try {
        const result = await pool.query(
            `UPDATE services SET
            name=$1, description=$2, price=$3, duration_hours=$4, features=$5, active=$6,
            sort_order=$7, updated_at=NOW()
            WHERE id=$8 RETURNING *`,
            [
                name, 
                description, 
                price, 
                duration_hours, 
                features ? JSON.stringify(features) : null, 
                active, 
                sort_order, 
                id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating service:', err);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// ---------------------------
// DELETE a service
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM services WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
        res.json({ message: 'Service deleted successfully', deletedService: result.rows[0] });
    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

module.exports = router;
