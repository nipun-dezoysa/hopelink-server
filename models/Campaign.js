import mongoose from "mongoose";

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
    type: String,
    required: [true, "Please provide a image"],
  },
  proof: {
    type: String,
    required: [true, "Please provide a proof letter"],
  },
  goal: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, "Please provide a goal"],
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
  },
  swift: {
    type: String,
    required: [true, "Please provide a swift code"],
  },
});

export default mongoose.model("Campaign", CampaignSchema);
