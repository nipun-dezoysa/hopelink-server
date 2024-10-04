import express from "express";
import { authenticateUser } from "../middlewares/authentication.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  uploadMiddleware.fields([
    { name: "img", maxCount: 1 },
    { name: "proof", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const img = req.files["img"][0].filename;
      const proof = req.files["proof"][0].filename;
      const {
        name,
        description,
        phone,
        goal,
        holder,
        bankName,
        accNumber,
        swift,
      } = req.body;
      const campDoc = await Campaign.create({
        name,
        description,
        phone,
        goal: goal * 100, // Convert to cents
        holder,
        bankName,
        accNumber,
        swift,
        createdBy: req.user._id,
        img,
        proof,
      });
      res.status(201).json(campDoc);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
);

router.put(
  "/",
  authenticateUser,
  uploadMiddleware.fields([
    { name: "img", maxCount: 1 },
    { name: "proof", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const img = req.files["img"] ? req.files["img"][0].filename : null;
      const proof = req.files["proof"] ? req.files["proof"][0].filename : null;
      const {
        id,
        name,
        description,
        phone,
        goal,
        holder,
        bankName,
        accNumber,
        swift,
      } = req.body;
      const campaignDoc = await Campaign.findById(id);
      if (!campaignDoc)
        return res.status(404).send({ message: "Campaign not found" });

      if (req.user.id != campaignDoc.createdBy)
        return res.status(401).json({ message: "Unauthorized" });
      await campaignDoc.updateOne({
        name,
        description,
        phone,
        goal,
        holder,
        bankName,
        accNumber,
        swift,
        img: img || campaignDoc.img,
        proof: proof || campaignDoc.proof,
      });
      res.status(201).json(campaignDoc);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
);

router.get("/user", authenticateUser, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user._id });
    const list = campaigns.map((campaign) => {
      const date = new Date(campaign.createdAt);
      return {
        id: campaign._id,
        name: campaign.name,
        created: date.toDateString(),
        phone: campaign.phone,
        goal: campaign.goal,
      };
    });
    res.status(200).json(list);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get("/user/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const campaignDoc = await Campaign.findById(id);
    if (!campaignDoc)
      return res.status(404).send({ message: "Campaign not found" });

    if (req.user.id != campaignDoc.createdBy)
      return res.status(401).json({ message: "Unauthorized" });

    return res.status(200).json(campaignDoc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find();

    const list = await Promise.all(
      campaigns.map(async (campaign) => {
        // Get the total sum of donations for this campaign
        const totalDonations = await Donation.aggregate([
          { $match: { donatedTo: campaign._id, status: "paid" } },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        const donationSum =
          totalDonations.length > 0 ? totalDonations[0].total : 0;

        const date = new Date(campaign.createdAt);
        return {
          id: campaign._id,
          name: campaign.name,
          description: campaign.description,
          created: date.toDateString(),
          phone: campaign.phone,
          goal: campaign.goal / 100,
          raised: donationSum / 100,
        };
      })
    );

    res.status(200).json(list);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Get all donations for this campaign
    const donations = await Donation.find({
      donatedTo: campaignId,
      status: "paid",
    }).populate({
      path: "createdBy",
      select: "fname lname email",
    });

    // Calculate the total sum of donations
    const totalDonations = donations.reduce(
      (sum, donation) => sum + parseFloat(donation.amount),
      0
    );

    const date = new Date(campaign.createdAt);
    const response = {
      id: campaign._id,
      name: campaign.name,
      description: campaign.description,
      created: date.toDateString(),
      img: campaign.img,
      phone: campaign.phone,
      goal: campaign.goal / 100,
      currentDonationSum: totalDonations / 100,
      donations: donations.map((donation) => ({
        id: donation._id,
        name:
          donation.usertype === "guest"
            ? donation.name
            : `${donation.createdBy.fname} ${donation.createdBy.lname}`,
        email:
          donation.usertype === "guest"
            ? donation.email
            : donation.createdBy.email,
        amount: donation.amount / 100,
        createdAt: new Date(donation.createdAt).toDateString(),
      })),
    };

    res.status(200).json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const campaignDoc = await Campaign.findById(id);
    if (!campaignDoc)
      return res.status(404).send({ message: "Campaign not found" });
    if (req.user.id != campaignDoc.createdBy)
      return res.status(401).json({ message: "Unauthorized" });
    await campaignDoc.deleteOne();
    return res.status(200).json({ message: "Campaign deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
