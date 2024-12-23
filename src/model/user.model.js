const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      required: true,
      type: String,
      index: true,
      unique: true,
    },
    firstName: {
      required: false,
      type: String,
    },
    lastName: {
      required: false,
      type: String,
    },
    avatar: {
      required: false,
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
