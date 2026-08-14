
import express from "express";
import mongoose from "mongoose";

import Winner from "../models/Winner.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// =====================================================
// GET ALL WINNERS
// GET /api/admin/winners
// =====================================================

router.get(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const winners = await Winner.find()
        .populate(
          "user",
          "name email totalWins totalPrizeMoney"
        )
        .populate(
          "draw",
          "month year numbers status publishedAt prizePool jackpot"
        )
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        winners,
      });
    } catch (error) {
      console.error("GET WINNERS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load winners",
      });
    }
  }
);

// =====================================================
// GET SINGLE WINNER
// GET /api/admin/winners/:id
// =====================================================

router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner ID",
        });
      }

      const winner = await Winner.findById(id)
        .populate(
          "user",
          "name email totalWins totalPrizeMoney"
        )
        .populate(
          "draw",
          "month year numbers status publishedAt prizePool jackpot"
        );

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      return res.json({
        success: true,
        winner,
      });
    } catch (error) {
      console.error("GET WINNER ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load winner",
      });
    }
  }
);

// =====================================================
// APPROVE WINNER
// PATCH /api/admin/winners/:id/approve
// =====================================================

router.patch(
  "/:id/approve",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner ID",
        });
      }

      const winner = await Winner.findById(id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      if (winner.verificationStatus === "approved") {
        return res.status(400).json({
          success: false,
          message: "Winner is already approved",
        });
      }

      const user = await User.findById(winner.user);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Winner user not found",
        });
      }

      // Update user statistics only once
      user.totalWins = (user.totalWins || 0) + 1;

      user.totalPrizeMoney =
        (user.totalPrizeMoney || 0) +
        Number(winner.prize || 0);

      await user.save();

      winner.verificationStatus = "approved";
      winner.verifiedAt = new Date();

      if (!winner.payoutStatus) {
        winner.payoutStatus = "pending";
      }

      await winner.save();

      const updatedWinner = await Winner.findById(id)
        .populate(
          "user",
          "name email totalWins totalPrizeMoney"
        )
        .populate(
          "draw",
          "month year numbers status publishedAt prizePool jackpot"
        );

      return res.json({
        success: true,
        message: "Winner approved successfully",
        winner: updatedWinner,
      });
    } catch (error) {
      console.error("APPROVE WINNER ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to approve winner",
      });
    }
  }
);

// =====================================================
// REJECT WINNER
// PATCH /api/admin/winners/:id/reject
// =====================================================

router.patch(
  "/:id/reject",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner ID",
        });
      }

      const winner = await Winner.findById(id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      // Paid winner cannot be rejected
      if (winner.payoutStatus === "paid") {
        return res.status(400).json({
          success: false,
          message:
            "Paid winner cannot be rejected",
        });
      }

      const user = await User.findById(winner.user);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Winner user not found",
        });
      }

      // Reverse statistics only if previously approved
      if (winner.verificationStatus === "approved") {
        user.totalWins = Math.max(
          0,
          (user.totalWins || 0) - 1
        );

        user.totalPrizeMoney = Math.max(
          0,
          (user.totalPrizeMoney || 0) -
            Number(winner.prize || 0)
        );

        await user.save();
      }

      winner.verificationStatus = "rejected";
      winner.verifiedAt = null;

      winner.payoutStatus = "pending";
      winner.paidAt = null;

      await winner.save();

      const updatedWinner = await Winner.findById(id)
        .populate(
          "user",
          "name email totalWins totalPrizeMoney"
        )
        .populate(
          "draw",
          "month year numbers status publishedAt prizePool jackpot"
        );

      return res.json({
        success: true,
        message: "Winner rejected successfully",
        winner: updatedWinner,
      });
    } catch (error) {
      console.error("REJECT WINNER ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to reject winner",
      });
    }
  }
);

// =====================================================
// UPDATE VERIFICATION
// PATCH /api/admin/winners/:id/verification
// =====================================================

router.patch(
  "/:id/verification",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        verificationStatus,
        proofUrl,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner ID",
        });
      }

      const validStatuses = [
        "pending",
        "approved",
        "rejected",
      ];

      if (!validStatuses.includes(verificationStatus)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid verification status",
        });
      }

      const winner = await Winner.findById(id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      // Paid winner cannot be moved back
      if (
        winner.payoutStatus === "paid" &&
        verificationStatus !== "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Paid winner verification cannot be changed",
        });
      }

      const user = await User.findById(winner.user);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Winner user not found",
        });
      }

      const oldStatus =
        winner.verificationStatus;

      const newStatus =
        verificationStatus;

      // =================================================
      // PENDING/REJECTED -> APPROVED
      // =================================================

      if (
        oldStatus !== "approved" &&
        newStatus === "approved"
      ) {
        user.totalWins =
          (user.totalWins || 0) + 1;

        user.totalPrizeMoney =
          (user.totalPrizeMoney || 0) +
          Number(winner.prize || 0);

        await user.save();

        winner.verifiedAt = new Date();
      }

      // =================================================
      // APPROVED -> REJECTED
      // =================================================

      if (
        oldStatus === "approved" &&
        newStatus === "rejected"
      ) {
        user.totalWins = Math.max(
          0,
          (user.totalWins || 0) - 1
        );

        user.totalPrizeMoney =
          Math.max(
            0,
            (user.totalPrizeMoney || 0) -
              Number(winner.prize || 0)
          );

        await user.save();

        winner.verifiedAt = null;
        winner.payoutStatus = "pending";
        winner.paidAt = null;
      }

      // =================================================
      // APPROVED -> PENDING
      // =================================================

      if (
        oldStatus === "approved" &&
        newStatus === "pending"
      ) {
        user.totalWins = Math.max(
          0,
          (user.totalWins || 0) - 1
        );

        user.totalPrizeMoney =
          Math.max(
            0,
            (user.totalPrizeMoney || 0) -
              Number(winner.prize || 0)
          );

        await user.save();

        winner.verifiedAt = null;
        winner.payoutStatus = "pending";
        winner.paidAt = null;
      }

      // =================================================
      // OTHER STATUS
      // =================================================

      if (newStatus === "rejected") {
        winner.verifiedAt = null;
      }

      if (newStatus === "pending") {
        winner.verifiedAt = null;
      }

      if (proofUrl !== undefined) {
        winner.proofUrl = proofUrl;
      }

      winner.verificationStatus =
        newStatus;

      await winner.save();

      const updatedWinner = await Winner.findById(id)
        .populate(
          "user",
          "name email totalWins totalPrizeMoney"
        )
        .populate(
          "draw",
          "month year numbers status publishedAt prizePool jackpot"
        );

      return res.json({
        success: true,
        message:
          `Winner verification updated to ${newStatus}`,
        winner: updatedWinner,
      });
    } catch (error) {
      console.error(
        "VERIFICATION UPDATE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update verification",
      });
    }
  }
);

// =====================================================
// MARK WINNER AS PAID
// PATCH /api/admin/winners/:id/pay
// =====================================================

router.patch(
  "/:id/pay",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner ID",
        });
      }

      const winner = await Winner.findById(id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      // =================================================
      // MUST BE APPROVED
      // =================================================

      if (
        winner.verificationStatus !== "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Winner must be approved before payout",
        });
      }

      // =================================================
      // PREVENT DUPLICATE PAYOUT
      // =================================================

      if (winner.payoutStatus === "paid") {
        return res.status(400).json({
          success: false,
          message:
            "Prize has already been paid",
        });
      }

      const prizeAmount =
        Number(winner.prize || 0);

      if (prizeAmount <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid prize amount",
        });
      }

      // =================================================
      // FIND / CREATE WALLET
      // =================================================

      let wallet = await Wallet.findOne({
        user: winner.user,
      });

      if (!wallet) {
        wallet = await Wallet.create({
          user: winner.user,
          balance: 0,
        });
      }

      // =================================================
      // EXTRA DUPLICATE PROTECTION
      // =================================================

      const existingTransaction =
        await Transaction.findOne({
          user: winner.user,
          reference: winner._id,
          type: "credit",
          description: "Prize money received",
        });

      if (existingTransaction) {
        return res.status(400).json({
          success: false,
          message:
            "Prize transaction already exists",
        });
      }

      // =================================================
      // CREDIT WALLET
      // =================================================

      wallet.balance += prizeAmount;

      await wallet.save();

      // =================================================
      // CREATE TRANSACTION
      // =================================================

      await Transaction.create({
        user: winner.user,

        type: "credit",

        amount: prizeAmount,

        description:
          "Prize money received",

        status: "completed",

        reference: winner._id,
      });

      // =================================================
      // UPDATE WINNER
      // =================================================

      winner.payoutStatus = "paid";
      winner.paidAt = new Date();

      await winner.save();

      // =================================================
      // RESPONSE
      // =================================================

      const updatedWinner =
        await Winner.findById(id)
          .populate(
            "user",
            "name email totalWins totalPrizeMoney"
          )
          .populate(
            "draw",
            "month year numbers status publishedAt prizePool jackpot"
          );

      return res.json({
        success: true,

        message:
          "Prize marked as paid and credited to wallet",

        winner: updatedWinner,

        walletBalance:
          wallet.balance,
      });
    } catch (error) {
      console.error(
        "PAYOUT UPDATE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update payout",
      });
    }
  }
);

export default router;

