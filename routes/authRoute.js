import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import EmailBuilder from "../services/emailBuilder.js";
import { authenticateUser } from "../middlewares/authentication.js";

const salt = bcrypt.genSaltSync(10);
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { fname, lname, email, password, phone, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    await User.create({
      fname,
      lname,
      email,
      password: bcrypt.hashSync(password, salt),
      phone,
      role: "user",
    });
    EmailBuilder.to(email).registration().send();
    res.status(201).json({ message: "user account created." });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Extract error messages from Mongoose validation errors
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors[0] });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `${field} already exists.` });
    }

    // Other errors
    res.status(400).json({ message: "An unexpected error occurred." });
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const passOk = bcrypt.compareSync(password, user.password);
    if (user.status === "blocked")
      return res.status(400).json({ message: "Account is blocked" });
    if (passOk) {
      jwt.sign(
        { email, id: user._id },
        process.env.SECRET_KEY,
        {},
        (err, token) => {
          if (err) {
            return res.status(400).json({ message: "Failed to log in" });
          } else {
            return res
              .cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
              })
              .json({
                id: user._id,
                email,
                fname: user.fname,
                lname: user.lname,
                role: user.role,
              });
          }
        }
      );
    } else {
      return res.status(400).json({ message: "Password is not correct" });
    }
  } else {
    return res.status(400).json({ message: "Account not found" });
  }
});

router.put("/password", authenticateUser, async (req, res) => {
  try {
    const { newPassword, confirmPassword, oldPassword } = req.body;
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });
    if (!bcrypt.compareSync(oldPassword, req.user.password))
      return res.status(400).json({ message: "Old password is incorrect" });
    await req.user.updateOne({ password: bcrypt.hashSync(newPassword, salt) });
    return res.status(200).json({ message: "Password Updated" });
  } catch (e) {
    console.log("User Details Update Endpoint Error: ", e);
    return res.status(400).json({ message: "unexpected error occurred" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").json("Logged out");
});

export default router;
