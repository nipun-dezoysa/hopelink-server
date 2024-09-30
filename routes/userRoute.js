import express from "express";
import { authenticateUser } from "../middlewares/authentication.js";

const router = express.Router();

router.route("/").get(authenticateUser, async (req, res) => {
  return res.status(200).json({
    id: req.user._id,
    email: req.user.email,
    fname: req.user.fname,
    lname: req.user.lname,
    role: req.user.role,
  });
});

export default router;
