// routes/reports.js
const express = require('express');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const { uploadOnCloudinary } = require('../utils/cloudinary'); // Update path as needed
const { useMulterFields } = require('../middleware/multerMiddleware'); // Update path as needed
const Report = require('../models/Report');
const Otp = require('../models/otp'); // For OTP validation in user report access
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Define fields for multer (shopPic, manPic, otherPic, reporterVisitingCard - all optional)
const uploadFields = useMulterFields([
  { name: 'shopPic', maxCount: 1 },
  { name: 'manPic', maxCount: 1 },
  { name: 'otherPic', maxCount: 1 },
  { name: 'reporterVisitingCard', maxCount: 1 }
]);



// PUBLIC: Create report with images (multipart/form-data)
router.post('/', uploadFields, async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || {};

    // Upload images to Cloudinary if provided
    let shopPicUrl = null;
    if (files.shopPic && files.shopPic[0]) {
      const shopResult = await uploadOnCloudinary(files.shopPic[0]);
      shopPicUrl = shopResult?.secure_url || null;
    }

    let manPicUrl = null;
    if (files.manPic && files.manPic[0]) {
      const manResult = await uploadOnCloudinary(files.manPic[0]);
      manPicUrl = manResult?.secure_url || null;
    }

    let otherPicUrl = null;
    if (files.otherPic && files.otherPic[0]) {
      const otherResult = await uploadOnCloudinary(files.otherPic[0]);
      otherPicUrl = otherResult?.secure_url || null;
    }

    let reporterVisitingCardUrl = null;
    if (files.reporterVisitingCard && files.reporterVisitingCard[0]) {
      const vcResult = await uploadOnCloudinary(files.reporterVisitingCard[0]);
      reporterVisitingCardUrl = vcResult?.secure_url || null;
    }

    // Create report with all schema fields
    const report = new Report({
      reporterName: data.reporterName,
      reporterBusiness: data.reporterBusiness,
      reporterMobile: data.reporterMobile,
      reporterVisitingCard: reporterVisitingCardUrl,
      buyerType: data.buyerType,
      personName: data.personName,
      fraudMobile1: data.fraudMobile1,
      fraudMobile2: data.fraudMobile2 || null,
      fraudMobile3: data.fraudMobile3 || null,
      fraudBusinessName: data.fraudBusinessName,
      fraudProvince: data.fraudProvince,
      fraudCity: data.fraudCity,
      customCity: data.customCity || null,
      cnicNumber: data.cnicNumber,
      moreDetails: data.moreDetails,
      shopPic: shopPicUrl,
      manPic: manPicUrl,
      otherPic: otherPicUrl,
      status: 'new',
      isApproved: false
    });

    await report.save();
    res.json({ message: 'Report created', report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ADMIN: Update report
router.put('/:id', authenticateToken, requireAdmin, uploadFields, async (req, res) => {
  try {
    const updates = req.body;
    const files = req.files || {};
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Update text fields (includes all new fields: fraudProvince, fraudMobile1/2/3, cnicNumber)
    Object.assign(report, updates);

    // Handle shopPic upload/replacement
    if (files.shopPic && files.shopPic[0]) {
      if (report.shopPic) {
        const oldPublicId = extractPublicId(report.shopPic);
        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
          } catch (deleteErr) {
            console.error('Failed to delete old shopPic:', deleteErr);
          }
        }
      }
      const newResult = await uploadOnCloudinary(files.shopPic[0]);
      report.shopPic = newResult?.secure_url || null;
    }

    // Handle manPic upload/replacement
    if (files.manPic && files.manPic[0]) {
      if (report.manPic) {
        const oldPublicId = extractPublicId(report.manPic);
        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
          } catch (deleteErr) {
            console.error('Failed to delete old manPic:', deleteErr);
          }
        }
      }
      const newResult = await uploadOnCloudinary(files.manPic[0]);
      report.manPic = newResult?.secure_url || null;
    }

    // Handle otherPic upload/replacement
    if (files.otherPic && files.otherPic[0]) {
      if (report.otherPic) {
        const oldPublicId = extractPublicId(report.otherPic);
        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
          } catch (deleteErr) {
            console.error('Failed to delete old otherPic:', deleteErr);
          }
        }
      }
      const newResult = await uploadOnCloudinary(files.otherPic[0]);
      report.otherPic = newResult?.secure_url || null;
    }

    // Handle reporterVisitingCard upload/replacement
    if (files.reporterVisitingCard && files.reporterVisitingCard[0]) {
      if (report.reporterVisitingCard) {
        const oldPublicId = extractPublicId(report.reporterVisitingCard);
        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
          } catch (deleteErr) {
            console.error('Failed to delete old reporterVisitingCard:', deleteErr);
          }
        }
      }
      const newResult = await uploadOnCloudinary(files.reporterVisitingCard[0]);
      report.reporterVisitingCard = newResult?.secure_url || null;
    }

    await report.save();
    res.json({ message: 'Report updated successfully', report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ADMIN: List reports (secured)
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;


    let filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { reporterName: { $regex: search, $options: 'i' } },
        { personName: { $regex: search, $options: 'i' } },
        { fraudBusinessName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
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



router.get('/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Missing id in parameter' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.isApproved = true;
    await report.save();
    res.json({ message: 'Report updated successfully', report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// PUBLIC: Get reports by OTP with read time tracking, pagination, and search
// Updated Route: GET /getByOtp (tracks cumulative read time indefinitely, city filter)
router.get('/getByOtp', async (req, res) => {
  try {
    const { otp, search, page = 1, limit = 10 } = req.query; // Removed sessionTime

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // Find OTP
    const otpDoc = await Otp.findOne({
      value: Number(otp),
      isExpired: false
    });

    if (!otpDoc) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // Get current used time (default 0) - Check against 30 minutes
    const usedMinutes = otpDoc.usedTime || 0;

    // Check if exceeds 30 minutes
    if (usedMinutes >= 30) {
      return res.status(403).json({
        message: 'Read time limit exceeded. You have no time left.',
        remainingTime: 0
      });
    }

    // Do NOT update usedTime here - just validate and grant access

    const remainingMinutes = 30 - usedMinutes;

    const city = otpDoc.city;

    // Build filter with city constraint (normalize for matching)
    const normalizedCity = city.toLowerCase().trim().replace(/\s+/g, ' ');
    let filter = {
      isApproved: true,
      fraudCity: {
        $regex: `^${normalizedCity}$`,
        $options: 'i' // Case-insensitive exact match, handles spaces
      }
    };

    // Add search if provided (case-insensitive)
    if (search) {
      const normalizedSearch = search.toLowerCase().trim().replace(/\s+/g, ' ');
      filter.$and = [
        filter, // Keep city filter
        {
          $or: [
            { reporterName: { $regex: normalizedSearch, $options: 'i' } },
            { personName: { $regex: normalizedSearch, $options: 'i' } },
            { fraudBusinessName: { $regex: normalizedSearch, $options: 'i' } }
          ]
        }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      message: `Reports for ${city} (Remaining read time: ${Math.ceil(remainingMinutes)} minutes)`,
      reports,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      city,
      remainingTime: Math.ceil(remainingMinutes), // In minutes
      usedTime: usedMinutes // Current cumulative used (for client reference)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN: Get one report (secured)
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ADMIN: Delete report (and delete images from Cloudinary)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });

    // Delete images from Cloudinary
    const imageFields = ['shopPic', 'manPic', 'otherPic', 'reporterVisitingCard'];
    for (const field of imageFields) {
      if (report[field]) {
        const publicId = extractPublicId(report[field]);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Successfully deleted ${field}: ${publicId}`);
          } catch (deleteErr) {
            console.error(`Failed to delete ${field} (${publicId}):`, deleteErr);
          }
        }
      }
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


const extractPublicId = (url) => {
  if (!url) return null;
  // Updated regex to capture full public_id after version (includes folders)
  const match = url.match(/\/v\d+\/(.*)\.[^\/]+$/);
  return match ? match[1] : null;
};