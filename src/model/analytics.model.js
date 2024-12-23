const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  shortUrl: { type: String, required: true },
  userAgent: { type: String },
  device: { type: String },
  os: { type: String },
  ipAddress: { type: String },
  geoLocation: {
    country: { type: String },
    region: { type: String },
    city: { type: String },
  },
  timestamp: { type: Date, default: Date.now },
});
const Analytics = mongoose.model("Analytics", analyticsSchema);
module.exports = Analytics;
