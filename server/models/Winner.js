import mongoose from "mongoose";

const winnerSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      draw: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Draw",
        required: true,
      },

      numbers: {
        type: [Number],
        default: [],
      },

      matchedNumbers: {
        type: [Number],
        default: [],
      },

      matchType: {
        type: String,
        enum: [
          "3-number",
          "4-number",
          "5-number",
        ],
        required: true,
      },

      prize: {
        type: Number,
        required: true,
        default: 0,
      },

      proofUrl: {
        type: String,
        default: "",
      },

      verificationStatus: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
      },

      payoutStatus: {
        type: String,
        enum: [
          "pending",
          "paid",
        ],
        default: "pending",
      },

      verifiedAt: {
        type: Date,
        default: null,
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

export default mongoose.model(
  "Winner",
  winnerSchema
);