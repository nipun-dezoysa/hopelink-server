import mongoose from "mongoose";
import validator from "validator";

const DonationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function () {
      return this.usertype === "guest";
    },
  },
  amount: {
    type: Number,
    required: [true, "Please provide a donation amount"],
    min: [0, "Donation amount must be a positive number"],
  },
  donatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: [true, "Please specify the campaign"],
  },
  usertype: {
    type: String,
    enum: ["registered", "guest"],
    required: [true, "Please specify if the donor is registered or a guest"],
  },
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
    required: function () {
      return this.usertype === "guest";
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.usertype === "registered";
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  session: {
    type: String,
    required: [true, "Please provide a session ID"],
  },
  status: {
    type: String,
    enum: ["paid", "unpaid", "pending"],
    required: [true, "Please provide the status of the donation"],
  },
});

export default mongoose.model("Donation", DonationSchema);
