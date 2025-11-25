const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all users
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET single user
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// CREATE user
router.post('/', async (req, res) => {
    const { username, email, password_hash, role } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (username,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING *',
            [username, email, password_hash, role || 'user']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// UPDATE user
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, password_hash, role } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET username=$1,email=$2,password_hash=$3,role=$4,updated_at=NOW() WHERE id=$5 RETURNING *',
            [username, email, password_hash, role, id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [id]);
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully', deletedUser: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ---------------------------
// LOGIN a user (NEW CODE)
// ---------------------------
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find the user by their username
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            // User not found
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // 2. Check if the password matches
        // WARNING: This is insecure. Your passwords should be hashed using 'bcrypt'.
        // This code works only because your 'Add User' form is also saving plain text.
        if (password === user.password_hash) {
            // Passwords match!
            res.json({ message: 'Login successful', user: user });
        } else {
            // Passwords do not match
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;