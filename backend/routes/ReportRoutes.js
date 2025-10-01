// routes/reports.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Report = require('../models/Report');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer disk storage (uploads/)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  }
});
const upload = multer({ storage });

// PUBLIC: Create report with images
// Use multipart/form-data. Field names: shopPic, manPic, otherPic (optional)
router.post('/', upload.any(), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || [];

    // Build images array
    const images = files.map(f => ({
      field: f.fieldname,
      url: `/uploads/${f.filename}`,
      filename: f.filename
    }));

    const report = new Report({
      reporterName: data.reporterName,
      reporterBusiness: data.reporterBusiness,
      reporterMobile: data.reporterMobile,
      fraudType: data.fraudType,
      personName: data.personName,
      fraudBusinessName: data.fraudBusinessName,
      fraudCity: data.fraudCity,
      moreDetails: data.moreDetails,
      images,
      status: 'new'
    });

    await report.save();
    res.json({ message: 'Report created', report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN: list reports
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reports = await Report.find(filter).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN: get one
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN: update a report (any fields, or status)
// Use application/json. To update images you'd need a separate endpoint (or accept multipart here).
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!report) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated', report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN: delete report (and unlink files)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });

    // Delete uploaded files
    for (const img of report.images || []) {
      const filePath = path.join(uploadDir, img.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await report.remove();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
