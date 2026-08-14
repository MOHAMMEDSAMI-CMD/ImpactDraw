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
      console.error("Get winners error:", error);

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

      return res.json({
        success: true,
        winner,
      });
    } catch (error) {
      console.error("Get winner error:", error);

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

      // -----------------------------------------------
      // Validate ID
      // -----------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner ID",
        });
      }

      // -----------------------------------------------
      // Find winner
      // -----------------------------------------------

      const winner =
        await Winner.findById(id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      // -----------------------------------------------
      // Already approved
      // -----------------------------------------------

      if (
        winner.verificationStatus ===
        "approved"
      ) {
        return res.status(400).json({
          success: false,
          message: "Winner is already approved",
        });
      }

      // -----------------------------------------------
      // Find user
      // -----------------------------------------------

      const user =
        await User.findById(winner.user);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Winner's user not found",
        });
      }

      // -----------------------------------------------
      // If previously rejected, don't double count
      // -----------------------------------------------

      if (
        winner.verificationStatus !==
        "approved"
      ) {
        user.totalWins =
          (user.totalWins || 0) + 1;

        user.totalPrizeMoney =
          (user.totalPrizeMoney || 0) +
          Number(winner.prize || 0);

        await user.save();
      }

      // -----------------------------------------------
      // Update winner
      // -----------------------------------------------

      winner.verificationStatus =
        "approved";

      winner.verifiedAt =
        new Date();

      // payout remains pending
      // until admin marks it paid

      winner.payoutStatus =
        winner.payoutStatus || "pending";

      await winner.save();

      // -----------------------------------------------
      // Populate response
      // -----------------------------------------------

      const updatedWinner =
        await Winner.findById(winner._id)
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
      console.error(
        "Approve winner error:",
        error
      );

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

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner ID",
        });
      }

      const winner =
        await Winner.findById(id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      // -----------------------------------------------
      // Find user
      // -----------------------------------------------

      const user =
        await User.findById(winner.user);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Winner's user not found",
        });
      }

      // -----------------------------------------------
      // If approved and not paid,
      // reverse user's statistics
      // -----------------------------------------------

      if (
        winner.verificationStatus ===
          "approved" &&
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

      // -----------------------------------------------
      // Update winner
      // -----------------------------------------------

      winner.verificationStatus =
        "rejected";

      winner.verifiedAt = null;

      if (
        winner.payoutStatus !== "paid"
      ) {
        winner.payoutStatus = "pending";
        winner.paidAt = null;
      }

      await winner.save();

      // -----------------------------------------------
      // Populate response
      // -----------------------------------------------

      const updatedWinner =
        await Winner.findById(winner._id)
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
      console.error(
        "Reject winner error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to reject winner",
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

      const winner =
        await Winner.findById(req.params.id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

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

      // -----------------------------------------------
      // Same status
      // -----------------------------------------------

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

      // -----------------------------------------------
      // PENDING / REJECTED -> APPROVED
      // -----------------------------------------------

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

      // -----------------------------------------------
      // APPROVED -> REJECTED
      // -----------------------------------------------

      else if (
        oldStatus === "approved" &&
        newStatus === "rejected"
      ) {
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

      // -----------------------------------------------
      // APPROVED -> PENDING
      // -----------------------------------------------

      else if (
        oldStatus === "approved" &&
        newStatus === "pending"
      ) {
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

      // -----------------------------------------------
      // REJECTED -> PENDING
      // -----------------------------------------------

      else if (
        oldStatus === "rejected" &&
        newStatus === "pending"
      ) {
        winner.verifiedAt = null;
      }

      // -----------------------------------------------
      // PENDING -> REJECTED
      // -----------------------------------------------

      else if (
        oldStatus === "pending" &&
        newStatus === "rejected"
      ) {
        winner.verifiedAt = null;
      }

      // -----------------------------------------------
      // Proof
      // -----------------------------------------------

      if (proofUrl !== undefined) {
        winner.proofUrl = proofUrl;
      }

      winner.verificationStatus =
        newStatus;

      await winner.save();

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
          `Winner verification updated to ${newStatus}`,
        winner: updatedWinner,
      });
    } catch (error) {
      console.error(
        "Verification update error:",
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
  "/:id/payout",
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
        await Winner.findById(
          req.params.id
        );

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

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

      if (
        winner.payoutStatus === "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Prize has already been paid",
        });
      }

    winner.payoutStatus = "paid";
winner.paidAt = new Date();

await winner.save();


// ===============================
// ADD PRIZE TO WALLET
// ===============================

let wallet = await Wallet.findOne({
  user: winner.user,
});


if (!wallet) {
  wallet = await Wallet.create({
    user: winner.user,
    balance: 0,
  });
}


wallet.balance += Number(
  winner.prize || 0
);


await wallet.save();



// ===============================
// CREATE TRANSACTION
// ===============================

await Transaction.create({

  user: winner.user,

  type: "credit",

  amount: Number(
    winner.prize || 0
  ),

  description:
    "Prize money received",

  status:
    "completed",

  reference:
    winner._id,

});
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
          "Prize marked as paid",
        winner: updatedWinner,
      });
    } catch (error) {
      console.error(
        "Payout update error:",
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