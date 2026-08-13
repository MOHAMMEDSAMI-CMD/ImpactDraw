
import express from "express";
import mongoose from "mongoose";

import Winner from "../models/Winner.js";
import User from "../models/User.js";

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

      res.json({
        success: true,
        winners,
      });
    } catch (error) {
      console.error(
        "Get winners error:",
        error
      );

      res.status(500).json({
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
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner ID",
        });
      }

      const winner =
        await Winner.findById(req.params.id)
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

      res.json({
        success: true,
        winner,
      });
    } catch (error) {
      console.error(
        "Get winner error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to load winner",
      });
    }
  }
);

// =====================================================
// UPDATE VERIFICATION STATUS
// PATCH /api/admin/winners/:id/verification
// =====================================================

router.patch(
  "/:id/verification",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        verificationStatus,
        proofUrl,
      } = req.body;

      // =================================================
      // VALIDATE ID
      // =================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner ID",
        });
      }

      // =================================================
      // VALIDATE STATUS
      // =================================================

      const validStatuses = [
        "pending",
        "approved",
        "rejected",
      ];

      if (
        !validStatuses.includes(
          verificationStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid verification status",
        });
      }

      // =================================================
      // FIND WINNER
      // =================================================

      const winner =
        await Winner.findById(req.params.id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      // =================================================
      // FIND USER
      // =================================================

      const user =
        await User.findById(winner.user);

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "Winner's user not found",
        });
      }

      const oldStatus =
        winner.verificationStatus;

      const newStatus =
        verificationStatus;

      // =================================================
      // SAME STATUS
      // =================================================

      if (oldStatus === newStatus) {
        if (proofUrl !== undefined) {
          winner.proofUrl = proofUrl;
          await winner.save();
        }

        const updatedWinner =
          await Winner.findById(
            winner._id
          )
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
            "Winner verification already has this status",
          winner: updatedWinner,
        });
      }

      // =================================================
      // APPROVE
      // pending/rejected -> approved
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

        winner.verifiedAt =
          new Date();
      }

      // =================================================
      // APPROVED -> REJECTED
      // =================================================

      else if (
        oldStatus === "approved" &&
        newStatus === "rejected"
      ) {
        // If already paid, do not reverse
        // user's winning statistics automatically.
        if (
          winner.payoutStatus !== "paid"
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
        }

        winner.verifiedAt = null;
      }

      // =================================================
      // APPROVED -> PENDING
      // =================================================

      else if (
        oldStatus === "approved" &&
        newStatus === "pending"
      ) {
        // Do not reverse already paid prize
        // automatically.
        if (
          winner.payoutStatus !== "paid"
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

          winner.payoutStatus =
            "pending";
          winner.paidAt = null;
        }

        winner.verifiedAt = null;
      }

      // =================================================
      // REJECTED -> PENDING
      // =================================================

      else if (
        oldStatus === "rejected" &&
        newStatus === "pending"
      ) {
        winner.verifiedAt = null;
      }

      // =================================================
      // PENDING -> REJECTED
      // =================================================

      else if (
        oldStatus === "pending" &&
        newStatus === "rejected"
      ) {
        winner.verifiedAt = null;
      }

      // =================================================
      // UPDATE PROOF
      // =================================================

      if (proofUrl !== undefined) {
        winner.proofUrl = proofUrl;
      }

      // =================================================
      // UPDATE VERIFICATION STATUS
      // =================================================

      winner.verificationStatus =
        newStatus;

      await winner.save();

      // =================================================
      // GET UPDATED WINNER
      // =================================================

      const updatedWinner =
        await Winner.findById(
          winner._id
        )
          .populate(
            "user",
            "name email totalWins totalPrizeMoney"
          )
          .populate(
            "draw",
            "month year numbers status publishedAt prizePool jackpot"
          );

      res.json({
        success: true,
        message:
          `Winner verification updated to ${newStatus}`,
        winner: updatedWinner,
      });
    } catch (error) {
      console.error(
        "Verification update error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update verification",
      });
    }
  }
);

// =====================================================
// MARK WINNER AS PAID
// PATCH /api/admin/winners/:id/payout
// =====================================================

router.patch(
  "/:id/payout",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      // =================================================
      // VALIDATE ID
      // =================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner ID",
        });
      }

      // =================================================
      // FIND WINNER
      // =================================================

      const winner =
        await Winner.findById(
          req.params.id
        );

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
        winner.verificationStatus !==
        "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Winner must be approved before payout",
        });
      }

      // =================================================
      // ALREADY PAID
      // =================================================

      if (
        winner.payoutStatus === "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Prize has already been paid",
        });
      }

      // =================================================
      // MARK AS PAID
      // =================================================

      winner.payoutStatus = "paid";
      winner.paidAt = new Date();

      await winner.save();

      // =================================================
      // GET UPDATED WINNER
      // =================================================

      const updatedWinner =
        await Winner.findById(
          winner._id
        )
          .populate(
            "user",
            "name email totalWins totalPrizeMoney"
          )
          .populate(
            "draw",
            "month year numbers status publishedAt prizePool jackpot"
          );

      res.json({
        success: true,
        message:
          "Prize marked as paid",
        winner: updatedWinner,
      });
    } catch (error) {
      console.error(
        "Payout update error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update payout",
      });
    }
  }
);

export default router;

