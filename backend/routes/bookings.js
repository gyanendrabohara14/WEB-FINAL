// routes/bookings.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------------------------
// GET all bookings
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bookings ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// ---------------------------
// GET single booking by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching booking:', err);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

// ---------------------------
// CREATE new booking
// ---------------------------
router.post('/', async (req, res) => {
    const {
        name,
        email,
        phone,
        service_type,
        booking_date,
        booking_time,
        location,
        notes,
        status,
        total_amount
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO bookings 
            (name, email, phone, service_type, booking_date, booking_time, location, notes, status, total_amount)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [name, email, phone, service_type, booking_date, booking_time, location, notes, status || 'pending', total_amount]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating booking:', err);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// ---------------------------
// UPDATE a booking
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        name,
        email,
        phone,
        service_type,
        booking_date,
        booking_time,
        location,
        notes,
        status,
        total_amount
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE bookings SET
            name=$1, email=$2, phone=$3, service_type=$4, booking_date=$5, booking_time=$6,
            location=$7, notes=$8, status=$9, total_amount=$10, updated_at=NOW()
            WHERE id=$11 RETURNING *`,
            [name, email, phone, service_type, booking_date, booking_time, location, notes, status, total_amount, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// ---------------------------
// DELETE a booking
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM bookings WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json({ message: 'Booking deleted successfully', deletedBooking: result.rows[0] });
    } catch (err) {
        console.error('Error deleting booking:', err);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

module.exports = router;
