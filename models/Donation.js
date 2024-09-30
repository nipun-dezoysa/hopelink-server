import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cash: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  donatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Campaign", CampaignSchema);
