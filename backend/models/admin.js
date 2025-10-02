const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Install via: npm install bcryptjs

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    isSuperAdmin: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords (for login)
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for unique fields
adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });

// Super Admin Credentials (Update these to change and sync on server restart)


// Function to sync/create/update super admin in DB
const syncSuperAdmin = async (SUPER_ADMIN_CREDS) => {
    try {
        const Admin = mongoose.model('Admin');
        let admin = await Admin.findOne({ isSuperAdmin: true });

        if (!admin) {
            // Create new super admin
            admin = new Admin(SUPER_ADMIN_CREDS);
        } else {
            // Update fields with static object
            admin.username = SUPER_ADMIN_CREDS.username;
            admin.email = SUPER_ADMIN_CREDS.email;
            admin.password = SUPER_ADMIN_CREDS.password; // Will be hashed via pre-save
            admin.isSuperAdmin = SUPER_ADMIN_CREDS.isSuperAdmin;
        }

        await admin.save();
        console.log('Super admin synced/created successfully');
    } catch (err) {
        console.error('Error syncing super admin:', err);
    }
};

module.exports = {
    Admin: mongoose.model('Admin', adminSchema),
    syncSuperAdmin
};