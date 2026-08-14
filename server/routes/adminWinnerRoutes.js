import express from "express";
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
        .populate("user", "name email")
        .populate(
          "draw",
          "month year numbers status publishedAt"
        )
        .sort({ createdAt: -1 })
        .lean();

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
// APPROVE WINNER
// PATCH /api/admin/winners/:id/approve
// =====================================================

router.patch(
  "/:id/approve",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const winner =
        await Winner.findById(req.params.id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      // Already approved
      if (
        winner.verificationStatus ===
        "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Winner is already approved",
        });
      }

      // Cannot approve rejected winner
      if (
        winner.verificationStatus ===
        "rejected"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rejected winner cannot be approved",
        });
      }

      winner.verificationStatus =
        "approved";

      winner.verifiedAt = new Date();

      await winner.save();

      // ---------------------------------------------
      // UPDATE USER STATISTICS
      // ---------------------------------------------

      await User.findByIdAndUpdate(
        winner.user,
        {
          $inc: {
            totalWins: 1,
            totalPrizeMoney:
              winner.prize,
          },
        }
      );

      res.json({
        success: true,
        message:
          "Winner approved successfully",
        winner,
      });
    } catch (error) {
      console.error(
        "Approve winner error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to approve winner",
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
      const winner =
        await Winner.findById(req.params.id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      if (
        winner.verificationStatus ===
        "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Approved winner cannot be rejected",
        });
      }

      winner.verificationStatus =
        "rejected";

      winner.verifiedAt = null;

      await winner.save();

      res.json({
        success: true,
        message:
          "Winner rejected successfully",
        winner,
      });
    } catch (error) {
      console.error(
        "Reject winner error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to reject winner",
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
      const winner =
        await Winner.findById(req.params.id);

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      // Must be approved first
      if (
        winner.verificationStatus !==
        "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Winner must be approved before payment",
        });
      }

      // Already paid
      if (
        winner.payoutStatus === "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Winner has already been paid",
        });
      }

      winner.payoutStatus = "paid";
      winner.paidAt = new Date();

      await winner.save();

      res.json({
        success: true,
        message:
          "Winner marked as paid successfully",
        winner,
      });
    } catch (error) {

        console.error("PAY WINNER ERROR:", error);
  console.error("STACK:", error.stack);

      console.error(
        "Pay winner error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to mark winner as paid",
      });
    }
  }
);

export default router;