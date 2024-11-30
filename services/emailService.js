import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function sendEmail(email, subject, text) {
  try {
    await transporter.sendMail({
      from: `"Hope Link" <${process.env.GMAIL_USER}>`, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: text, // html body
    });
  } catch (error) {
    console.log(error);
  }
}

export default sendEmail;
