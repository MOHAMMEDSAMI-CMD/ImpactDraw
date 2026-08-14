import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },

    reference: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceModel: {
      type: String,
      enum: ["Winner", "Withdrawal", null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Transaction",
  transactionSchema
);