import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";

const router = express.Router();

// ==========================================
// STRIPE
// ==========================================

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing");
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;


// ==========================================
// HELPER
// ACTIVATE USER SUBSCRIPTION
// ==========================================

const activateUserSubscription = async ({
  userId,
  plan,
  session = null,
  subscriptionId = null,
}) => {
  if (!userId) {
    throw new Error("User ID is missing");
  }

  if (!["monthly", "yearly"].includes(plan)) {
    throw new Error("Invalid subscription plan");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
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

  // ==========================================
  // SAVE PAYMENT HISTORY
  // ==========================================

  if (session) {
    const existingPayment =
      await SubscriptionPayment.findOne({
        stripeSessionId: session.id,
      });

    if (!existingPayment) {
      let amount = 0;

      try {
        const lineItems =
          await stripe.checkout.sessions.listLineItems(
            session.id,
            {
              limit: 1,
            }
          );

        amount =
          lineItems.data?.[0]?.price?.unit_amount || 0;
      } catch (error) {
        console.error(
          "Could not get Stripe line item:",
          error.message
        );
      }

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
          subscriptionId ||
          session.subscription ||
          null,

        paidAt: new Date(),
      });

      console.log(
        "✅ Subscription payment history saved"
      );
    } else {
      console.log(
        "ℹ️ Payment history already exists"
      );
    }
  }

  return user;
};


// ==========================================
// CREATE CHECKOUT SESSION
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
          message:
            "Stripe secret key is not configured",
        });
      }

      const { plan } = req.body;

      if (
        !["monthly", "yearly"].includes(plan)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid subscription plan",
        });
      }

      const user =
        await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const priceId =
        plan === "monthly"
          ? process.env
              .STRIPE_MONTHLY_PRICE_ID
          : process.env
              .STRIPE_YEARLY_PRICE_ID;

      if (
        !priceId ||
        priceId.includes("xxxxxxxx")
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Stripe Price ID is not configured correctly",
        });
      }

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

          // Session metadata
          metadata: {
            userId:
              user._id.toString(),
            plan,
          },

          // IMPORTANT:
          // Copy metadata to Stripe subscription
          subscription_data: {
            metadata: {
              userId:
                user._id.toString(),
              plan,
            },
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
          message:
            "Stripe secret key is not configured",
        });
      }

      const { session_id } =
        req.query;

      if (!session_id) {
        return res.status(400).json({
          success: false,
          message:
            "Session ID is required",
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
          message:
            "Payment not completed",
        });
      }

      if (
        session.metadata?.userId !==
        req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Unauthorized payment session",
        });
      }

      const plan =
        session.metadata?.plan;

      if (
        !["monthly", "yearly"].includes(
          plan
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid subscription plan",
        });
      }

      const user =
        await activateUserSubscription({
          userId: req.user.id,
          plan,
          session,
          subscriptionId:
            session.subscription ||
            null,
        });

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
// STRIPE WEBHOOK
// POST /api/subscriptions/webhook
// ==========================================

router.post(
  "/webhook",
  express.raw({
    type: "application/json",
  }),
  async (req, res) => {
    if (!stripe) {
      return res.status(500).send(
        "Stripe is not configured"
      );
    }

    const signature =
      req.headers[
        "stripe-signature"
      ];

    if (!signature) {
      return res.status(400).send(
        "Missing Stripe signature"
      );
    }

    let event;

    try {
      event =
        stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env
            .STRIPE_WEBHOOK_SECRET
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
        const session =
          event.data.object;

        const userId =
          session.metadata?.userId;

        const plan =
          session.metadata?.plan;

        if (!userId || !plan) {
          console.error(
            "❌ Webhook metadata missing"
          );

          return res.json({
            received: true,
          });
        }

        if (
          session.payment_status !==
          "paid"
        ) {
          console.log(
            "Payment not paid yet"
          );

          return res.json({
            received: true,
          });
        }

        await activateUserSubscription({
          userId,
          plan,
          session,
          subscriptionId:
            session.subscription ||
            null,
        });

        console.log(
          "✅ Subscription activated through webhook"
        );
      }


      // ========================================
      // SUBSCRIPTION UPDATED
      // ========================================

      else if (
        event.type ===
        "customer.subscription.updated"
      ) {
        const subscription =
          event.data.object;

        const userId =
          subscription.metadata?.userId;

        const plan =
          subscription.metadata?.plan;

        if (userId && plan) {
          const user =
            await User.findById(
              userId
            );

          if (user) {
            user.subscriptionStatus =
              "active";

            user.subscriptionPlan =
              plan;

            await user.save();

            console.log(
              "✅ Subscription updated"
            );
          }
        }
      }


      // ========================================
      // SUBSCRIPTION DELETED
      // ========================================

      else if (
        event.type ===
        "customer.subscription.deleted"
      ) {
        const subscription =
          event.data.object;

        const userId =
          subscription.metadata?.userId;

        if (userId) {
          const user =
            await User.findById(
              userId
            );

          if (user) {
            user.subscriptionStatus =
              "cancelled";

            await user.save();

            console.log(
              "✅ Subscription cancelled"
            );
          }
        }
      }


      // ========================================
      // INVOICE PAID
      // ========================================

      else if (
        event.type ===
        "invoice.paid"
      ) {
        console.log(
          "✅ Stripe invoice paid:",
          event.data.object.id
        );
      }


      // ========================================
      // INVOICE PAYMENT FAILED
      // ========================================

      else if (
        event.type ===
        "invoice.payment_failed"
      ) {
        console.log(
          "⚠️ Stripe invoice payment failed:",
          event.data.object.id
        );
      }

    } catch (error) {
      console.error(
        "❌ Webhook processing error:",
        error
      );

      return res.status(500).json({
        received: true,
        success: false,
      });
    }

    return res.json({
      received: true,
      success: true,
    });
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


// ==========================================
// PAYMENT HISTORY
// GET /api/subscriptions/history
// ==========================================

router.get(
  "/history",
  requireAuth,
  async (req, res) => {
    try {
      const payments =
        await SubscriptionPayment.find({
          user: req.user.id,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        payments,
      });

    } catch (error) {
      console.error(
        "GET SUBSCRIPTION HISTORY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load subscription payment history",
      });
    }
  }
);

export default router;