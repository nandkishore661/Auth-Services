// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, required: true, enum: ['customer', 'restaurant_owner', 'delivery_personnel', 'admin'] },
    address: { type: String },
    contact_details: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User ', userSchema);