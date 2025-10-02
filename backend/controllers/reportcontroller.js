const Report = require('../models/Report');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');

// PUBLIC: Create report with images
exports.createReport = async (req, res) => {
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
};

// ADMIN: list reports
exports.getReports = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const reports = await Report.find(filter).sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ADMIN: get one
exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Not found' });
        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ADMIN: update a report (any fields, or status)
// Use application/json. To update images you'd need a separate endpoint (or accept multipart here).
exports.updateReport = async (req, res) => {
    try {
        const updates = req.body;
        const report = await Report.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!report) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Updated', report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ADMIN: delete report (and unlink files)
exports.deleteReport = async (req, res) => {
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
};