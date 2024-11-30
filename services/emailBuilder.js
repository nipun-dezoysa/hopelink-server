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

  static async send() {
    await sendEmail(this.email, this.subject, this.body);
    this.email = "";
    this.subject = "";
    this.body = "";
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

  static donationReceivedOwner(ownerName, donorName, amount, campaign) {
    this.subject = "New Donation Received for Your Campaign!";
    this.body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50; text-align: center;">You've Received a New Donation!</h2>
        <p style="font-size: 16px; color: #333;">Dear ${ownerName},</p>
        <p style="font-size: 16px; color: #555;">
          We are excited to inform you that <b>${donorName}</b> has just donated <b>$${amount}</b> to your campaign, <b>${campaign.name}</b>.
        </p>
        <p style="font-size: 16px; color: #555;">
          Your campaign is gaining support, and this donation will help further its progress. Keep up the fantastic work!
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.CLIENT_URL}/campaigns/${campaign._id}" style="background-color: #4CAF50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Campaign Progress</a>
        </div>
        <p style="font-size: 16px; color: #555;">
          If you have any questions or need any assistance, feel free to reach out to us at any time.
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

  static campaignGoalReached(userName, campaign, totalDonations) {
    this.subject = "Congratulations! Your Campaign Has Reached Its Goal!";
    this.body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50; text-align: center;">Congratulations!</h2>
        <p style="font-size: 16px; color: #333;">Dear ${userName},</p>
        <p style="font-size: 16px; color: #555;">
          We are thrilled to inform you that your campaign, <b>${campaign.name}</b>, has successfully reached its goal!
        </p>
        <p style="font-size: 16px; color: #555;">
          The total amount raised is <b>$${totalDonations}</b>. Your hard work and dedication have made a significant impact, and we couldn't be more proud of you!
        </p>
        <p style="font-size: 16px; color: #555;">
          Thank you for your commitment to making a difference. You can continue to share your campaign with others to further support your cause.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.CLIENT_URL}/campaigns/${campaign._id}" style="background-color: #4CAF50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Your Campaign</a>
        </div>
        <p style="font-size: 16px; color: #555;">
          If you have any questions or need assistance, feel free to reach out to us at any time.
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
}
