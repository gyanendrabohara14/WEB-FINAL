// routes/order_items.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---------------------------
// GET all order items
// ---------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM order_items ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching order items:', err);
        res.status(500).json({ error: 'Failed to fetch order items' });
    }
});

// ---------------------------
// GET single order item by ID
// ---------------------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM order_items WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order item not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching order item:', err);
        res.status(500).json({ error: 'Failed to fetch order item' });
    }
});

// ---------------------------
// CREATE new order item
// ---------------------------
router.post('/', async (req, res) => {
    const { order_id, product_id, quantity, price } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [order_id, product_id, quantity, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating order item:', err);
        res.status(500).json({ error: 'Failed to create order item' });
    }
});

// ---------------------------
// UPDATE an order item
// ---------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { order_id, product_id, quantity, price } = req.body;
    try {
        const result = await pool.query(
            `UPDATE order_items SET
            order_id=$1, product_id=$2, quantity=$3, price=$4, updated_at=NOW()
            WHERE id=$5 RETURNING *`,
            [order_id, product_id, quantity, price, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order item not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating order item:', err);
        res.status(500).json({ error: 'Failed to update order item' });
    }
});

// ---------------------------
// DELETE an order item
// ---------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM order_items WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order item not found' });
        res.json({ message: 'Order item deleted successfully', deletedOrderItem: result.rows[0] });
    } catch (err) {
        console.error('Error deleting order item:', err);
        res.status(500).json({ error: 'Failed to delete order item' });
    }
});

module.exports = router;
