// routes/user.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const SECRET_KEY = 'your_secret_key'; // Change this to a secure key in production

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// GET /profile: Retrieve user profile details
router.get('/profile', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id);
        if (!user) {
            return res.sendStatus(404);
        }
        res.json({ name: user.name, email: user.email, role: user.role, address: user.address, contact_details: user.contact_details });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving profile', error });
    }
});

// PUT /profile: Update user profile details
router.put('/profile', authenticateJWT, async (req, res) => {
    const { address, contact_details } = req.body;

    try {
        const user = await User.findById(req.user.user_id);
        if (!user) {
            return res.sendStatus(404);
        }
        // Update user profile details
        user.address = address || user.address;
        user.contact_details = contact_details || user.contact_details;

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
});

// Export the router
module.exports = router;
       