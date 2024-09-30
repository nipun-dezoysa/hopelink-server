import express from "express";
import { authenticateUser } from "../middlewares/authentication.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import Campaign from "../models/Campaign.js";

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
        goal,
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

router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const campaignDoc = await Campaign.findById(id);
    if (!campaignDoc)
      return res.status(404).send({ message: "Campaign not found" });
    if(req.user.id != campaignDoc.createdBy)
      return res.status(401).json({ message: "Unauthorized" });
    await campaignDoc.deleteOne();
    return res.status(200).json({ message: "Campaign deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
