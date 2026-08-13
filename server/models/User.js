
import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 45,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const userSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC USER INFORMATION
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // =========================
    // ADMIN
    // =========================

    isAdmin: {
      type: Boolean,
      default: false,
    },

    // =========================
    // SUBSCRIPTION
    // =========================

    subscriptionStatus: {
      type: String,
      enum: [
        "active",
        "inactive",
        "cancelled",
        "past_due",
      ],
      default: "inactive",
    },

    subscriptionPlan: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null,
    },

    subscriptionStartDate: {
      type: Date,
      default: null,
    },

    subscriptionRenewalDate: {
      type: Date,
      default: null,
    },

    // Stripe subscription ID
    stripeCustomerId: {
      type: String,
      default: null,
    },

    stripeSubscriptionId: {
      type: String,
      default: null,
    },

    // =========================
    // CHARITY
    // =========================

    charity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      default: null,
    },

    // Minimum 10%
    charityPercentage: {
      type: Number,
      min: 10,
      max: 100,
      default: 10,
    },

    // =========================
    // GOLF SCORES
    // =========================

    scores: {
      type: [scoreSchema],
      default: [],
    },

    // =========================
    // DRAW STATISTICS
    // =========================

    drawsEntered: {
      type: Number,
      default: 0,
    },

    totalWins: {
      type: Number,
      default: 0,
    },

    totalPrizeMoney: {
      type: Number,
      default: 0,
    },

    // =========================
    // ACCOUNT STATUS
    // =========================

    isActive: {
      type: Boolean,
      default: true,
    },

    // =========================
    // TIMESTAMPS
    // =========================
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
