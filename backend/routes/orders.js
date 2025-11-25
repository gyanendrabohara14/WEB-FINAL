// routes/orders.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------------------------
// GET all orders
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// ---------------------------
// GET single order by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM orders WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// ---------------------------
// CREATE new order
// ---------------------------
router.post('/', async (req, res) => {
    const { customer_name, customer_email, customer_phone, shipping_address, total_amount, status, payment_status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO orders
            (customer_name, customer_email, customer_phone, shipping_address, total_amount, status, payment_status)
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [
                customer_name, 
                customer_email, 
                customer_phone || null, 
                shipping_address || null, 
                total_amount, 
                status || 'pending', 
                payment_status || 'pending'
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// ---------------------------
// UPDATE an order
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { customer_name, customer_email, customer_phone, shipping_address, total_amount, status, payment_status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE orders SET
            customer_name=$1, customer_email=$2, customer_phone=$3, shipping_address=$4,
            total_amount=$5, status=$6, payment_status=$7, updated_at=NOW()
            WHERE id=$8 RETURNING *`,
            [
                customer_name, 
                customer_email, 
                customer_phone, 
                shipping_address, 
                total_amount, 
                status, 
                payment_status, 
                id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// ---------------------------
// DELETE an order
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM orders WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted successfully', deletedOrder: result.rows[0] });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

module.exports = router;
