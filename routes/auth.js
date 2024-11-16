// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const SECRET_KEY = 'your_secret_key'; // Change this to a secure key in production


// POST /register: Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password, role, address, contact_details } = req.body;

    try {
        // Check if user already exists
        const existingUser  = await User.findOne({ email });
        if (existingUser ) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser  = new User({
            name,
            email,
            password_hash: hashedPassword,
            role,
            address,
            contact_details,
        });

        await newUser .save();
        res.status(201).json({ message: 'User  registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// POST /login: Authenticate a user and issue a JWT
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ user_id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// Export the router
module.exports = router;
       