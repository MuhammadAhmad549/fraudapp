// routes/admin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models/admin');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// PUBLIC: Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '1h' } // Adjust as needed
        );

        // Exclude password from response
        const { password: _, ...adminWithoutPassword } = admin.toObject();

        res.json({
            message: 'Login successful',
            token,
            admin: adminWithoutPassword
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN: List all admins
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { search } = req.query; // Optional search by username or email
        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const admins = await Admin.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(admins);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN: Create new admin (protected)
router.post('/', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists with this username or email' });
        }

        // Create new admin (password hashed via pre-save hook)
        const newAdmin = new Admin({ username, password, email });
        await newAdmin.save();

        // Exclude password
        const { password: _, ...adminWithoutPassword } = newAdmin.toObject();

        res.status(201).json({ message: 'Admin created successfully', admin: adminWithoutPassword });
    } catch (err) {
        console.error('Create admin error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN: Get one admin
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN: Update admin (password will be hashed if provided)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const updates = req.body;
        // If password is provided, it will be hashed via pre-save, but since we're using findByIdAndUpdate,
        // we need to handle it manually if password is in updates
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update fields
        Object.assign(admin, updates);

        // Hash password if modified
        if (updates.password) {
            const salt = await require('bcryptjs').genSalt(10);
            admin.password = await require('bcryptjs').hash(updates.password, salt);
        }

        await admin.save();

        // Exclude password
        const { password: _, ...adminWithoutPassword } = admin.toObject();

        res.json({ message: 'Admin updated successfully', admin: adminWithoutPassword });
    } catch (err) {
        console.error('Update admin error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN: Delete admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await admin.remove();
        res.json({ message: 'Admin deleted successfully' });
    } catch (err) {
        console.error('Delete admin error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;