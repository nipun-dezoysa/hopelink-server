import express from "express";
import {
  authenticateUser,
  authorizePermission,
} from "../middlewares/authentication.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", authenticateUser, async (req, res) => {
  return res.status(200).json({
    id: req.user._id,
    email: req.user.email,
    fname: req.user.fname,
    lname: req.user.lname,
    role: req.user.role,
  });
});

router.get(
  "/all",
  authenticateUser,
  authorizePermission("admin"),
  async (req, res) => {
    try {
      const users = await User.find();
      const list = users.map((user) => {
        return {
          id: user._id,
          name: user.fname + " " + user.lname,
          email: user.email,
          role: user.role,
        };
      });
      return res.status(200).json(list);
    } catch (e) {
      console.log("User Endpoint Error: ", e);
      return res.status(400).json({ message: "unexpected error occurred" });
    }
  }
);

router.put(
  "/update/:id",
  authenticateUser,
  authorizePermission("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });
      await user.updateOne({role});
      return res.status(200).json({ message: "User updated" });
    } catch (e) {
      console.log("User Endpoint Error: ", e);
      return res.status(400).json({ message: "unexpected error occurred" });
    }
  }
);
export default router;
