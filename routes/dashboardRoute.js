import express from "express";
import {
  authenticateUser,
  authorizePermission,
} from "../middlewares/authentication.js";
import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";
const router = express.Router();

router.get(
  "/admin",
  authenticateUser,
  authorizePermission("admin"),
  async (req, res) => {
    try {
      const userCount = await User.countDocuments();
      const campaignCount = await Campaign.countDocuments();
      const lastTwoDonations = await Donation.find()
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order (-1 means newest first)
        .limit(2)
        .populate([
          { path: "donatedTo"},
          {
            path: "createdBy"
          },
        ]); // Limit to 2 results
      const list = lastTwoDonations.map((donation) => {
        return {
          name:
            donation.usertype === "guest"
              ? donation.name
              : `${donation.createdBy.fname} ${donation.createdBy.lname}`,
          amount: donation.amount / 100,
          campaign: donation.donatedTo.name,
        };
      });
      return res.status(200).json({ userCount, campaignCount, list });
    } catch (e) {
      console.log("User Endpoint Error: ", e);
      return res.status(400).json({ message: "unexpected error occurred" });
    }
  }
);

export default router;
