// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Reporter details
  reporterName: { type: String, required: true },
  reporterBusiness: { type: String },
  reporterMobile: { type: String, required: true }, // 11 digits
  reporterVisitingCard: { type: String }, // Optional visiting card URL

  // Fraud details
  fraudType: { type: String }, // Removed from client form but keeping for backward compatibility
  buyerType: { type: String, required: true },
  personName: { type: String, required: true },
  fraudMobile1: { type: String, required: true }, // Primary fraud mobile (11 digits)
  fraudMobile2: { type: String }, // Optional secondary fraud mobile (11 digits)
  fraudMobile3: { type: String }, // Optional tertiary fraud mobile (11 digits)
  fraudBusinessName: { type: String },
  fraudProvince: { type: String, required: true }, // Province (e.g., Punjab, Sindh)
  fraudCity: { type: String, required: true }, // City under selected province
  customCity: { type: String }, // If "Other / Village Name" chosen in city
  cnicNumber: { type: String, required: true }, // CNIC (13 digits)
  moreDetails: { type: String, required: true },

  // Evidence images
  shopPic: { type: String },   // Cloudinary URL
  manPic: { type: String },
  otherPic: { type: String },

  // Status for admin workflow
  status: {
    type: String,
    enum: ['new', 'in-progress', 'closed'],
    default: 'new'
  },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);