// routes/otps.js
const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const Otp = require('../models/otp'); // Adjust path as needed
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
require('dotenv').config();

const USER_JWT_SECRET = process.env

const router = express.Router();

// ADMIN: Create OTP (protected) - Admin enters OTP and city
router.post('/create', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { value, city } = req.body;

        // Validate inputs
        if (!value || !city) {
            return res.status(400).json({ message: 'OTP value and city are required' });
        }
        if (!Number.isInteger(Number(value)) || value.toString().length !== 6) {
            return res.status(400).json({ message: 'OTP must be a 6-digit number' });
        }

        const otp = new Otp({
            value: Number(value),
            usedTime: null,
            city,
            isExpired: false
        });

        await otp.save();
        res.status(201).json({ message: 'OTP created successfully', otp: { id: otp._id, value, city } });
    } catch (err) {
        console.error('Create OTP error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// ADMIN: List OTPs with pagination and search (protected)
router.get('/get-by-filter', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        let filter = {};
        if (search) {
            filter.$or = [
                { value: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const otps = await Otp.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Otp.countDocuments(filter);

        res.json({
            otps,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/validate-otp', async (req, res) => {
    try {
        const { otpValue } = req.body;

        if (!otpValue) {
            return res.status(400).json({ message: 'OTP is required' });
        }

        const otp = await Otp.findOne({
            value: Number(otpValue),
            isExpired: false,
        });

        if (!otp) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        await otp.save();

        return res.json({
            message: 'OTP validated successfully',
            otp: otp.value,
            city: otp.city
        });

    } catch (err) {
        console.error('Validate OTP error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// New Route: POST /update-read-time (for incrementing used time after verification)
router.post('/update-read-time', async (req, res) => {
    try {
        const { otpValue, sessionMinutes = 5 } = req.body; // Default 5 min per call if not provided

        if (!otpValue) {
            return res.status(400).json({ message: 'OTP is required' });
        }

        // Find OTP by value
        const otp = await Otp.findOne({
            value: Number(otpValue),
            isExpired: false
        });

        if (!otp) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        // Check if already expired (30 days from creation)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (otp.createdAt < thirtyDaysAgo) {
            otp.isExpired = true;
            await otp.save();
            return res.status(401).json({ message: 'OTP expired after 30 days' });
        }

        // Get current used time (default 0)
        let currentUsedTime = otp.usedTime || 0;
        const increment = parseFloat(sessionMinutes) || 5;
        const newUsedTime = currentUsedTime + increment;

        // Check if exceeds 30 minutes total
        if (newUsedTime > 30) {
            return res.status(403).json({
                message: `Read time limit exceeded. Remaining: ${30 - currentUsedTime} minutes.`,
                remainingTime: 30 - currentUsedTime
            });
        }

        // Update used time
        otp.usedTime = newUsedTime;
        await otp.save();

        const remainingTime = 30 - newUsedTime;
        const city = otp.city;

        res.json({
            message: 'Read time updated successfully',
            usedTime: newUsedTime,
            remainingTime: remainingTime,
            city: city
        });
    } catch (err) {
        console.error('Update read time error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;