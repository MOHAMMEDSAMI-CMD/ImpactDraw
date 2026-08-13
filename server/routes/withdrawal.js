import express from "express";
import Wallet from "../models/Wallet.js";
import Withdrawal from "../models/Withdrawal.js";
import Transaction from "../models/Transaction.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// CREATE WITHDRAWAL
// POST /api/withdrawals
// ==========================================

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const {
      amount,
      method,
      upiId,
      accountHolderName,
      accountNumber,
      ifscCode,
    } = req.body;

    // ------------------------------
    // Validate amount
    // ------------------------------

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal amount",
      });
    }

    const withdrawalAmount = Number(amount);

    // ------------------------------
    // Validate method
    // ------------------------------

    if (!["upi", "bank"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal method",
      });
    }

    // ------------------------------
    // Validate UPI
    // ------------------------------

    if (method === "upi" && !upiId) {
      return res.status(400).json({
        success: false,
        message: "UPI ID is required",
      });
    }

    // ------------------------------
    // Validate bank details
    // ------------------------------

    if (
      method === "bank" &&
      (!accountHolderName ||
        !accountNumber ||
        !ifscCode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete bank details are required",
      });
    }

    // ------------------------------
    // Get wallet
    // ------------------------------

    const wallet = await Wallet.findOne({
      user: userId,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    // ------------------------------
    // Check balance
    // ------------------------------

    if (wallet.balance < withdrawalAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // ------------------------------
    // Deduct amount
    // ------------------------------

    wallet.balance -= withdrawalAmount;

    await wallet.save();

    // ------------------------------
    // Create withdrawal
    // ------------------------------

    const withdrawal = await Withdrawal.create({
      user: userId,
      amount: withdrawalAmount,
      method,
      upiId: method === "upi" ? upiId : "",
      accountHolderName:
        method === "bank"
          ? accountHolderName
          : "",
      accountNumber:
        method === "bank"
          ? accountNumber
          : "",
      ifscCode:
        method === "bank"
          ? ifscCode
          : "",
      status: "pending",
    });

    // ------------------------------
    // Create transaction
    // ------------------------------

    const transaction =
      await Transaction.create({
        user: userId,
        type: "debit",
        amount: withdrawalAmount,
        description: "Withdrawal request",
        status: "pending",
        reference: withdrawal._id,
      });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted",
      withdrawal,
      transaction,
      walletBalance: wallet.balance,
    });
  } catch (error) {
    console.error(
      "Create withdrawal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create withdrawal",
    });
  }
});

// ==========================================
// GET MY WITHDRAWALS
// GET /api/withdrawals
// ==========================================

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const withdrawals =
      await Withdrawal.find({
        user: userId,
      }).sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error(
      "Get withdrawals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load withdrawals",
    });
  }
});

export default router;