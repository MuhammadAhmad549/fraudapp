const mongoose = require('mongoose');


const otpSchema = new mongoose.Schema({
    value: { type: Number },
    usedTime: { type: Number, default: 0 },
    city: { type: String },
    isExpired: { type: Boolean, default: false }
}, { timestamps: true })


module.exports = mongoose.model('otp', otpSchema)