import express from "express";
import Winner from "../models/Winner.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// GET ALL WINNERS
// GET /api/admin/winners
// ==========================================

router.get(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const winners = await Winner.find()
        .populate("user", "name email")
        .populate("draw")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        winners,
      });
    } catch (error) {
      console.error("Get winners error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load winners",
      });
    }
  }
);

// ==========================================
// VERIFY WINNER
// PATCH /api/admin/winners/:winnerId/verify
// ==========================================

router.patch(
  "/:winnerId/verify",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { winnerId } = req.params;

      const winner = await Winner.findById(winnerId);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      // Already verified
      if (
        winner.verificationStatus === "verified" ||
        winner.verificationStatus === "approved"
      ) {
        return res.status(400).json({
          success: false,
          message: "Winner is already verified",
        });
      }

      winner.verificationStatus = "verified";
      winner.verifiedAt = new Date();

      await winner.save();

      return res.json({
        success: true,
        message: "Winner verified successfully",
        winner,
      });
    } catch (error) {
      console.error("Verify winner error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to verify winner",
      });
    }
  }
);

// ==========================================
// PAY WINNER
// PATCH /api/admin/winners/:winnerId/pay
// ==========================================

router.patch(
  "/:winnerId/pay",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { winnerId } = req.params;

      // ======================================
      // FIND WINNER
      // ======================================

      const winner =
        await Winner.findById(winnerId);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      // ======================================
      // VERIFY WINNER FIRST
      // ======================================

      if (
        winner.verificationStatus !== "verified" &&
        winner.verificationStatus !== "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Winner must be verified before payout",
        });
      }

      // ======================================
      // ALREADY PAID
      // ======================================

      if (
        winner.payoutStatus === "paid"
      ) {
        return res.status(400).json({
          success: false,
          message: "Prize is already paid",
        });
      }

      // ======================================
      // VALIDATE PRIZE
      // ======================================

      const prize = Number(winner.prize);

      if (
        !Number.isFinite(prize) ||
        prize <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid prize amount",
        });
      }

      // ======================================
      // FIND / CREATE WALLET
      // ======================================

      let wallet =
        await Wallet.findOne({
          user: winner.user,
        });

      if (!wallet) {
        wallet = await Wallet.create({
          user: winner.user,
          balance: 0,
        });
      }

      // ======================================
      // ADD PRIZE TO WALLET
      // ======================================

      wallet.balance =
        Number(wallet.balance || 0) +
        prize;

      await wallet.save();

      // ======================================
      // CREATE TRANSACTION
      // ======================================

      const transaction =
        await Transaction.create({
          user: winner.user,
          type: "credit",
          amount: prize,
          description: "Draw prize payout",
          status: "completed",
          reference: winner._id,
        });

      // ======================================
      // UPDATE WINNER
      // ======================================

      winner.payoutStatus = "paid";
      winner.paidAt = new Date();

      await winner.save();

      // ======================================
      // RESPONSE
      // ======================================

      return res.json({
        success: true,
        message: "Prize paid successfully",

        payout: {
          amount: prize,
          walletBalance: wallet.balance,
        },

        transaction,

        winner,
      });
    } catch (error) {
      console.error(
        "Pay winner error:",
        error
      );

      console.error(
        "STACK:",
        error.stack
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to pay winner",
      });
    }
  }
);

export default router;