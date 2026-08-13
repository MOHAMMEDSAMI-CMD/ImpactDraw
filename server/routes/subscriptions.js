import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Check environment variable
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing in .env");
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// ==========================================
// CREATE STRIPE CHECKOUT SESSION
// POST /api/subscriptions/create-checkout-session
// ==========================================

router.post(
  "/create-checkout-session",
  requireAuth,
  async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({
          success: false,
          message: "Stripe secret key is not configured",
        });
      }

      const { plan } = req.body;

      if (!["monthly", "yearly"].includes(plan)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription plan",
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const priceId =
        plan === "monthly"
          ? process.env.STRIPE_MONTHLY_PRICE_ID
          : process.env.STRIPE_YEARLY_PRICE_ID;

      if (!priceId || priceId.includes("xxxxxxxx")) {
        return res.status(500).json({
          success: false,
          message: "Stripe Price ID is not configured correctly",
        });
      }

      console.log("Stripe key loaded: YES");
      console.log("Stripe price:", priceId);

      const session =
        await stripe.checkout.sessions.create({
          mode: "subscription",

          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],

          customer_email: user.email,

          metadata: {
            userId: user._id.toString(),
            plan,
          },

          success_url:
            `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${process.env.CLIENT_URL}/pricing`,
        });

      return res.json({
        success: true,
        url: session.url,
      });

    } catch (error) {
      console.error(
        "❌ Create checkout session error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create Stripe checkout session",
      });
    }
  }
);

// ==========================================
// VERIFY PAYMENT
// GET /api/subscriptions/verify?session_id=...
// ==========================================

router.get(
  "/verify",
  requireAuth,
  async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({
          success: false,
          message: "Stripe secret key is not configured",
        });
      }

      const { session_id } = req.query;

      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: "Session ID is required",
        });
      }

      const session =
        await stripe.checkout.sessions.retrieve(
          session_id
        );

      if (
        session.payment_status !== "paid" &&
        session.status !== "complete"
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment not completed",
        });
      }

      if (
        session.metadata?.userId !==
        req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized payment session",
        });
      }

      const plan = session.metadata?.plan;

      if (!["monthly", "yearly"].includes(plan)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription plan",
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const startDate = new Date();
      const renewalDate = new Date(startDate);

      if (plan === "monthly") {
        renewalDate.setMonth(
          renewalDate.getMonth() + 1
        );
      } else {
        renewalDate.setFullYear(
          renewalDate.getFullYear() + 1
        );
      }

      user.subscriptionStatus = "active";
      user.subscriptionPlan = plan;
      user.subscriptionStartDate = startDate;
      user.subscriptionRenewalDate = renewalDate;

      await user.save();

      return res.json({
        success: true,
        message:
          "Payment verified and subscription activated",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          subscriptionStatus:
            user.subscriptionStatus,
          subscriptionPlan:
            user.subscriptionPlan,
          subscriptionStartDate:
            user.subscriptionStartDate,
          subscriptionRenewalDate:
            user.subscriptionRenewalDate,
        },
      });

    } catch (error) {
      console.error(
        "❌ Verify payment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to verify payment",
      });
    }
  }
);

// ==========================================
// OLD ACTIVATE ROUTE
// ==========================================

router.post(
  "/activate",
  requireAuth,
  async (req, res) => {
    return res.status(400).json({
      success: false,
      message:
        "Direct activation is disabled. Please complete Stripe payment.",
    });
  }
);

export default router;