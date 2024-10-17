import mongoose from "mongoose";
import validator from "validator";
const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
  },
  phone: {
    type: String,
    required: [true, "Please provide Phone number"],
    minlength: 10,
    maxlength: 10,
  },
  img: {
    data: Buffer, // Store the image as binary data
    contentType: String, // Store the image MIME type
  },
  proof: {
    data: Buffer, // Store the proof letter as binary data
    contentType: String, // Store the proof's MIME type
  },
  goal: {
    type: Number,
    required: [true, "Please provide a goal amount"],
    min: [0, "Goal must be a positive number"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  acceptedAt: {
    type: Date,
  },
  holder: {
    type: String,
    required: [true, "Please provide a bank holder name"],
  },
  bankName: {
    type: String,
    required: [true, "Please provide a bank name"],
  },
  accNumber: {
    type: String,
    required: [true, "Please provide a bank acc number"],
    validate: {
      validator: function (v) {
        return /^\d+$/.test(v); // Ensure it contains only digits
      },
      message: "Account number must contain only digits",
    },
  },
  swift: {
    type: String,
    required: [true, "Please provide a swift code"],
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

export default mongoose.model("Campaign", CampaignSchema);
