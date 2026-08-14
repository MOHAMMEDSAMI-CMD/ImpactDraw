import mongoose from "mongoose";

const subscriptionPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "inr",
      lowercase: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "cancelled",
      ],
      default: "pending",
    },

    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    stripePaymentIntentId: {
      type: String,
      default: null,
      index: true,
    },

    stripeSubscriptionId: {
      type: String,
      default: null,
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionPayment =
  mongoose.model(
    "SubscriptionPayment",
    subscriptionPaymentSchema
  );

export default SubscriptionPayment;