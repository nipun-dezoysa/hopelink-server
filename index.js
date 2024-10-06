import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

import dotenv from "dotenv";
dotenv.config();

// app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true, // Enable credentials (cookies, auth headers)
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//importing routes
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import campaignRoute from "./routes/campaignRoute.js";
import donationRoute from "./routes/donationRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";

//routes
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/campaign", campaignRoute);
app.use("/donation", donationRoute);
app.use("/dashboard", dashboardRoute);

try {
  mongoose.connect(process.env.DB_URL);
  app.listen(4000, () => console.log("Server running on port: 4000"));
} catch (err) {
  console.log(err);
}
