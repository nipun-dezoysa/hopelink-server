import mongoose from "mongoose";
import validator from "validator";

const UserSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, "Please provide first name"],
  },
  lname: {
    type: String,
    required: [true, "Please provide last name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  phone: {
    type: String,
    required: [true, "Please provide Phone number"],
    minlength: 10,
    maxlength: 10,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

export default mongoose.model("User", UserSchema);
