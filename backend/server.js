// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


const authRoutes = require('./routes/authroutes');
const reportRoutes = require('./routes/ReportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { syncSuperAdmin } = require('./models/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for application/json

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const SUPER_ADMIN_CREDS = {
  username: 'super admin',
  email: 'superadmin@fraudwatch.com',
  password: '12345678',
  isSuperAdmin: true
};


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Connect to MongoDB & start server
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/fraudwatch';

mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
    // syncSuperAdmin(SUPER_ADMIN_CREDS);
    app.listen(PORT, () => console.log(
      `================================\nServer running on port ${PORT}\n================================`
    ));
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });
