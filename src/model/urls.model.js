const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    longUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true },
    topic: { type: String },
    createdBy: { type: mongoose.Types.ObjectId },
  },
  {
    timestamps: true,
  }
);

const Url = mongoose.model("Url", urlSchema);
module.exports = Url;
