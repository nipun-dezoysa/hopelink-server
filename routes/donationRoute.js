import express from "express";
import { isAuthenticated } from "../middlewares/authentication.js";
import Stripe from "stripe";
import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";
import dotenv from "dotenv";
import EmailBuilder from "../services/emailBuilder.js";
import User from "../models/User.js";
dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { amount, campaign, email, name } = req.body;
    const camp = await Campaign.findById(campaign);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: camp.name,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.Server_URL}/donation/confirm/?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.Server_URL}/donation/confirm/?session={CHECKOUT_SESSION_ID}`,
    });
    if (req.user) {
      await Donation.create({
        amount: amount * 100,
        donatedTo: campaign,
        usertype: "registered",
        createdBy: req.user._id,
        session: session.id,
        status: "pending",
      });
    } else {
      await Donation.create({
        amount: amount * 100,
        donatedTo: campaign,
        usertype: "guest",
        email,
        name,
        session: session.id,
        status: "pending",
      });
    }

    res.status(201).json({ message: "Donation successful.", url: session.url });
  } catch (error) {
    res.status(400).json({ message: "An unexpected error occurred." });
    console.log(error);
  }
});

router.get("/confirm", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session);
    const donation = await Donation.findOne({
      session: req.query.session,
    }).populate([
      {
        path: "createdBy",
      },
      { path: "donatedTo" },
    ]);

    const result = await Donation.aggregate([
      {
        $match: {
          donatedTo: donation.donatedTo._id, // Match the specific campaign
          status: "paid", // Only count "paid" donations
        },
      },
      {
        $group: {
          _id: "$donatedTo", // Group by campaign
          totalAmount: { $sum: "$amount" }, // Sum the "amount" field
        },
      },
    ]);

    const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

    await donation.updateOne({ status: session.payment_status });

    await EmailBuilder.to(
      donation.usertype === "guest" ? donation.email : donation.createdBy.email
    )
      .donation(
        donation.usertype === "guest"
          ? donation.name
          : `${donation.createdBy.fname} ${donation.createdBy.lname}`,
        donation.amount / 100,
        donation.donatedTo
      )
      .send();

    const owner = await User.findById(donation.donatedTo.createdBy);

    await EmailBuilder.to(owner.email)
      .donationReceivedOwner(
        owner.fname + " " + owner.lname,
        donation.usertype === "guest"
          ? donation.name
          : `${donation.createdBy.fname} ${donation.createdBy.lname}`,
        donation.amount / 100,
        donation.donatedTo
      )
      .send();

    if (
      totalAmount < donation.donatedTo.goal &&
      totalAmount + donation.amount >= donation.donatedTo.goal
    ) {
      EmailBuilder.to(owner.email)
        .campaignGoalReached(
          owner.fname + " " + owner.lname,
          donation.donatedTo,
          totalAmount + donation.amount
        )
        .send();
    }

    res.redirect(
      `${process.env.CLIENT_URL}/campaigns/${donation.donatedTo._id}?status=${session.payment_status}`
    );
  } catch (e) {
    res.status(400).json({ message: "An unexpected error occurred." });
    console.log(e);
  }
});

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   (req, res) => {
//     const sig = req.headers["stripe-signature"];

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         "webhook secret"
//       );
//     } catch (err) {
//       console.error(`⚠️  Webhook signature verification failed:`, err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle the event
//     switch (event.type) {
//       case "payment_intent.succeeded":
//         const paymentIntent = event.data.object;
//         console.log(`PaymentIntent was successful for ${paymentIntent.amount}`);
//         // Update your order/payment status in the database
//         break;
//       case "checkout.session.completed":
//         const session = event.data.object;
//         console.log(`Checkout session completed: ${session.id}`);
//         // Update your order status
//         break;
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     res.json({ received: true });
//   }
// );

export default router;
