import sendEmail from "./emailService.js";
import dotenv from "dotenv";
dotenv.config();

export default class EmailBuilder {
  static email = "";
  static subject = "";
  static body = "";

  static to(email) {
    this.email = email;
    return this;
  }

  static registration() {
    this.subject = "Registration";
    this.body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50; text-align: center;">Welcome to Hope Link!</h2>
        <p style="font-size: 16px; color: #333;">Dear User,</p>
        <p style="font-size: 16px; color: #555;">
          We are thrilled to have you join the <b>Hope Link</b> community! By signing up, you've taken the first step towards making a positive impact on many lives. 
        </p>
        <p style="font-size: 16px; color: #555;">
          You can now log in to your account and start exploring the various opportunities to contribute, support causes, and engage with our mission.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.CLIENT_URL}/login" style="background-color: #4CAF50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Log In to Your Account</a>
        </div>
        <p style="font-size: 16px; color: #555;">
          If you have any questions, or need assistance, please don’t hesitate to reach out. We are here to support you every step of the way.
        </p>
        <p style="font-size: 16px; color: #555;">Best regards,<br/><b>The Hope Link Team</b></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email, please do not reply. If you have any questions, visit our <a href="${process.env.CLIENT_URL}/contact" style="color: #4CAF50;">contact page</a>.
        </p>
      </div>
    `;
    return this;
  }

  static donation(name, amount, campaign) {
    this.subject = "Donation Confirmation";
    this.body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50; text-align: center;">Thank You for Your Generous Donation!</h2>
        <p style="font-size: 16px; color: #333;">Dear ${name},</p>
        <p style="font-size: 16px; color: #555;">
          We are deeply appreciative of your generous donation of <b>$${amount}</b> to support the <b>${campaign.name}</b> campaign.
        </p>
        <p style="font-size: 16px; color: #555;">
          Your contribution will have a lasting impact and help us continue making a difference in the lives of those in need. Together, we can create a brighter future.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.CLIENT_URL}/campaigns/${campaign._id}" style="background-color: #4CAF50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Campaign Progress</a>
        </div>
        <p style="font-size: 16px; color: #555;">
          If you have any questions about your donation, please feel free to reach out to us.
        </p>
        <p style="font-size: 16px; color: #555;">With heartfelt thanks,<br/><b>The Hope Link Team</b></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This email was sent to you as a confirmation of your donation. Please do not reply to this message. If you need to contact us, visit our <a href="${process.env.CLIENT_URL}/contact" style="color: #4CAF50;">contact page</a>.
        </p>
      </div>
    `;
    return this;
  }

  static async send() {
    await sendEmail(this.email, this.subject, this.body);
    this.email = "";
    this.subject = "";
    this.body = "";
  }
}
