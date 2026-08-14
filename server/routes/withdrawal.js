import express from "express";

import Wallet from "../models/Wallet.js";
import Withdrawal from "../models/Withdrawal.js";
import Transaction from "../models/Transaction.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// =====================================================
// CREATE WITHDRAWAL
// POST /api/withdrawals
// =====================================================

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      amount,
      method,
      upiId,
      accountHolderName,
      accountNumber,
      ifscCode,
    } = req.body;

    const withdrawalAmount = Number(amount);

    // =========================
    // AMOUNT
    // =========================

    if (
      !Number.isFinite(withdrawalAmount) ||
      withdrawalAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal amount",
      });
    }

    if (withdrawalAmount < 50) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum withdrawal amount is ₹50",
      });
    }

    // =========================
    // METHOD
    // =========================

    if (!["upi", "bank"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal method",
      });
    }

    // =========================
    // UPI
    // =========================

    if (method === "upi" && !upiId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "UPI ID is required",
      });
    }

    // =========================
    // BANK
    // =========================

    if (
      method === "bank" &&
      (
        !accountHolderName?.trim() ||
        !accountNumber?.trim() ||
        !ifscCode?.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complete bank details are required",
      });
    }

    // =========================
    // EXISTING REQUEST
    // =========================

    const existingWithdrawal =
      await Withdrawal.findOne({
        user: userId,
        status: {
          $in: ["pending", "approved"],
        },
      });

    if (existingWithdrawal) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a pending withdrawal request",
      });
    }

    // =========================
    // WALLET
    // =========================

    let wallet = await Wallet.findOne({
      user: userId,
    });

    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
      });
    }

    // =========================
    // BALANCE
    // =========================

    if (wallet.balance < withdrawalAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // =========================
    // DEDUCT
    // =========================

    wallet.balance -= withdrawalAmount;

    await wallet.save();

    // =========================
    // CREATE WITHDRAWAL
    // =========================

    const withdrawal =
      await Withdrawal.create({
        user: userId,

        amount: withdrawalAmount,

        method,

        upiId:
          method === "upi"
            ? upiId.trim()
            : "",

        accountHolderName:
          method === "bank"
            ? accountHolderName.trim()
            : "",

        accountNumber:
          method === "bank"
            ? accountNumber.trim()
            : "",

        ifscCode:
          method === "bank"
            ? ifscCode.trim().toUpperCase()
            : "",

        status: "pending",
      });

    // =========================
    // TRANSACTION
    // =========================

    const transaction =
      await Transaction.create({
        user: userId,

        type: "debit",

        amount: withdrawalAmount,

        description: "Withdrawal request",

        status: "pending",

        reference: withdrawal._id,

        referenceType: "Withdrawal",
      });

    return res.status(201).json({
      success: true,

      message:
        "Withdrawal request submitted",

      withdrawal,

      transaction,

      walletBalance: wallet.balance,
    });
  } catch (error) {
    console.error(
      "CREATE WITHDRAWAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create withdrawal",
    });
  }
});

// =====================================================
// GET MY WITHDRAWALS
// GET /api/withdrawals
// =====================================================

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const withdrawals =
      await Withdrawal.find({
        user: userId,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error(
      "GET WITHDRAWALS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load withdrawals",
    });
  }
});

export default router;