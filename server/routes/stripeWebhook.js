import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.error("❌ STRIPE_WEBHOOK_SECRET is missing");
}

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

// ==========================================
// STRIPE WEBHOOK
// POST /api/stripe/webhook
// IMPORTANT:
// This route must receive RAW body.
// ==========================================

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature =
      req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error(
        "❌ Stripe webhook signature error:",
        error.message
      );

      return res.status(400).send(
        `Webhook Error: ${error.message}`
      );
    }

    console.log(
      "✅ Stripe webhook received:",
      event.type
    );

    try {
      // ========================================
      // CHECKOUT COMPLETED
      // ========================================

      if (
        event.type ===
        "checkout.session.completed"
      ) {
        const session = event.data.object;

        const userId =
          session.metadata?.userId;

        const plan =
          session.metadata?.plan;

        if (!userId) {
          console.error(
            "❌ Webhook userId missing"
          );

          return res.json({
            received: true,
          });
        }

        if (
          !["monthly", "yearly"].includes(plan)
        ) {
          console.error(
            "❌ Invalid subscription plan:",
            plan
          );

          return res.json({
            received: true,
          });
        }

        // ======================================
        // FIND USER
        // ======================================

        const user =
          await User.findById(userId);

        if (!user) {
          console.error(
            "❌ User not found:",
            userId
          );

          return res.json({
            received: true,
          });
        }

        // ======================================
        // PREVENT DUPLICATE PAYMENT
        // ======================================

        const existingPayment =
          await SubscriptionPayment.findOne({
            stripeSessionId: session.id,
          });

        if (existingPayment) {
          console.log(
            "ℹ️ Payment already processed:",
            session.id
          );

          return res.json({
            received: true,
          });
        }

        // ======================================
        // GET LINE ITEMS
        // ======================================

        const lineItems =
          await stripe.checkout.sessions.listLineItems(
            session.id,
            {
              limit: 1,
            }
          );

        const amount =
          lineItems.data?.[0]?.price
            ?.unit_amount || 0;

        // ======================================
        // SUBSCRIPTION DATES
        // ======================================

        const startDate = new Date();

        const renewalDate =
          new Date(startDate);

        if (plan === "monthly") {
          renewalDate.setMonth(
            renewalDate.getMonth() + 1
          );
        } else {
          renewalDate.setFullYear(
            renewalDate.getFullYear() + 1
          );
        }

        // ======================================
        // ACTIVATE USER
        // ======================================

        user.subscriptionStatus =
          "active";

        user.subscriptionPlan =
          plan;

        user.subscriptionStartDate =
          startDate;

        user.subscriptionRenewalDate =
          renewalDate;

        await user.save();

        // ======================================
        // SAVE PAYMENT HISTORY
        // ======================================

        await SubscriptionPayment.create({
          user: user._id,

          plan,

          amount: amount / 100,

          currency:
            session.currency || "inr",

          status: "paid",

          stripeSessionId:
            session.id,

          stripePaymentIntentId:
            session.payment_intent || null,

          stripeSubscriptionId:
            session.subscription || null,

          paidAt: new Date(),
        });

        console.log(
          "✅ Subscription activated:",
          user.email
        );

        console.log(
          "✅ Payment history saved"
        );
      }

      // ========================================
      // PAYMENT FAILED
      // ========================================

      if (
        event.type ===
        "invoice.payment_failed"
      ) {
        const invoice =
          event.data.object;

        console.log(
          "⚠️ Subscription payment failed:",
          invoice.id
        );
      }

      // ========================================
      // SUBSCRIPTION DELETED
      // ========================================

      if (
        event.type ===
        "customer.subscription.deleted"
      ) {
        const subscription =
          event.data.object;

        const customerId =
          subscription.customer;

        console.log(
          "⚠️ Subscription cancelled:",
          customerId
        );

        // Agar future me Stripe customer ID
        // User model me save karoge to yahan
        // subscriptionStatus inactive kar sakte ho.
      }

      // ========================================
      // ALWAYS ACKNOWLEDGE STRIPE
      // ========================================

      return res.json({
        received: true,
      });
    } catch (error) {
      console.error(
        "❌ Stripe webhook processing error:",
        error
      );

      return res.status(500).json({
        received: false,
      });
    }
  }
);

export default router;