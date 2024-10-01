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
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // Ensure it has 10 digits
      },
      message: "Phone number must be 10 digits",
    },
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

export default mongoose.model("User", UserSchema);
