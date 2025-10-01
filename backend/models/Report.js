







// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Reporter details
  reporterName: { type: String, required: true },
  reporterBusiness: { type: String },
  reporterMobile: { type: String, required: true },
  reporterVisitingCard: { type: String }, // Optional visiting card

  // Fraud details
  fraudType: { type: String, required: true },
  buyerType: { type: String, required: true },
  personName: { type: String, required: true },
  fraudMobile: { type: String, required: true }, // NEW field (11 digits)
  fraudBusinessName: { type: String },
  fraudCity: { type: String, required: true },
  customCity: { type: String }, // if "Other" city chosen
  cninNumber: { type: String, required: true }, // CNIC (13 digits)
  moreDetails: { type: String, required: true },

  // Evidence images
  shopPic: { type: String },   // stored file path (e.g., /uploads/xyz.jpg)
  manPic: { type: String },
  otherPic: { type: String },

  // Status for admin workflow
  status: { 
    type: String, 
    enum: ['new','in-progress','closed'], 
    default: 'new' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);




// const mongoose= require ('mongoose');

// const reportSchema = new mongoose.Schema(
//   {
//     reporterName: { type: String, required: true },
//     reporterBusiness: { type: String },
//     reporterMobile: { type: String, required: true },
//     fraudType: { type: String, required: true },
//     buyerType: { type: String, required: true },
//     personName: { type: String, required: true },
//     fraudBusinessName: { type: String },
//     fraudCity: { type: String, required: true },
//     moreDetails: { type: String, required: true },
//     shopPic: { type: String },
//     manPic: { type: String },
//     otherPic: { type: String },
//     status: { type: String, default: "new" }
//   },
//   { timestamps: true }
// );

// module.export= mongoose.model("Report", reportSchema);
