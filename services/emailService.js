import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "servicehopelink@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});

async function sendEmail(email, subject, text) {
  try {
    await transporter.sendMail({
      from: '"Hope Link" <servicehopelink@gmail.com>', // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      // text: text, // plain text body
      html: text, // html body
    });
  } catch (error) {
    console.log(error);
  }
}

export default sendEmail;
