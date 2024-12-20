import express from "express";
import {
  authenticateUser,
  authorizePermission,
} from "../middlewares/authentication.js";
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
      const imgBuffer = req.files["img"][0].buffer;
      const imgMimetype = req.files["img"][0].mimetype;
      const proofBuffer = req.files["proof"][0].buffer;
      const proofMimetype = req.files["proof"][0].mimetype;

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
        img: {
          data: imgBuffer,
          contentType: imgMimetype,
        },
        proof: {
          data: proofBuffer,
          contentType: proofMimetype,
        },
      });

      res.status(201).json(campDoc);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
);

router.put(
  "/:id",
  authenticateUser,
  uploadMiddleware.fields([
    { name: "img", maxCount: 1 },
    { name: "proof", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const imgBuffer = req.files["img"] ? req.files["img"][0].buffer : null;
      const imgMimetype = req.files["img"]
        ? req.files["img"][0].mimetype
        : null;
      const proofBuffer = req.files["proof"]
        ? req.files["proof"][0].buffer
        : null;
      const proofMimetype = req.files["proof"]
        ? req.files["proof"][0].mimetype
        : null;

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
      const campaignDoc = await getCampaign(req);
      if (!campaignDoc)
        return res.status(404).send({ message: "Campaign not found" });

      if (req.user.id != campaignDoc.createdBy)
        return res.status(401).json({ message: "Unauthorized" });
      await campaignDoc.updateOne({
        name,
        description,
        phone,
        goal: goal * 100,
        holder,
        bankName,
        accNumber,
        swift,
        img: imgBuffer
          ? {
              data: imgBuffer,
              contentType: imgMimetype,
            }
          : campaignDoc.img,
        proof: proofBuffer
          ? {
              data: proofBuffer,
              contentType: proofMimetype,
            }
          : campaignDoc.proof,
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
        status: campaign.status,
      };
    });
    res.status(200).json(list);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get("/user/:id", authenticateUser, async (req, res) => {
  try {
    const campaignDoc = await getCampaign(req);
    if (!campaignDoc)
      return res.status(404).send({ message: "Campaign not found" });

    if (req.user.id != campaignDoc.createdBy)
      return res.status(401).json({ message: "Unauthorized" });

    return res.status(200).json(campaignDoc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get(
  "/admin",
  authenticateUser,
  authorizePermission("admin"),
  async (req, res) => {
    try {
      const campaigns = await Campaign.find().populate({
        path: "createdBy",
        select: "fname lname email",
      });
      const list = campaigns.map((campaign) => {
        return {
          id: campaign._id,
          name: campaign.name,
          organizer: campaign.createdBy.fname + " " + campaign.createdBy.lname,
          description: campaign.description,
          status: campaign.status,
          donationValue: `${campaign.goal / 100} USD`,
        };
      });
      res.status(200).json(list);
    } catch (e) {
      res.status(400).json({ message: "An unexpected error occurred." });
      console.log(error);
    }
  }
);

router.put("/admin/:id", async (req, res) => {
  try {
    const campaignDoc = await getCampaign(req);
    if (!campaignDoc)
      return res.status(404).send({ message: "Campaign not found" });

    const { status } = req.body;
    console.log(status);

    await campaignDoc.updateOne({
      status,
    });
    res.status(201).json({ status });
  } catch (e) {
    res.status(400).json({ message: "An unexpected error occurred." });
    console.log(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "accepted" });

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
    const campaign = await getCampaign(req);
    if (!campaign || campaign.status !== "accepted") {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Get all donations for this campaign
    const donations = await Donation.find({
      donatedTo: campaign._id,
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
      img: `data:${
        campaign.img.contentType
      };base64,${campaign.img.data.toString("base64")}`, // Add image as base64 data URL
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

router.get("/download-proof/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign || !campaign.proof) {
      return res.status(404).json({ message: "Proof not found" });
    }

    // Set the headers to serve the file as a PDF
    res.set({
      "Content-Type": campaign.proof.contentType,
      "Content-Disposition": `attachment; filename="proof-${campaign._id}.pdf"`,
    });

    // Send the PDF data
    res.send(campaign.proof.data);
  } catch (e) {
    res.status(500).json({ message: "Error retrieving proof" });
  }
});

router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const campaignDoc = await getCampaign(req);
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

async function getCampaign(req) {
  const { id } = req.params;
  const campaignDoc = await Campaign.findById(id);
  return campaignDoc;
}

export default router;
