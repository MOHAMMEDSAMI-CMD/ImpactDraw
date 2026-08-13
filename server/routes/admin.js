import express from "express";
import User from "../models/User.js";
import Winner from "../models/Winner.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// GET ALL USERS
// GET /api/admin/users
// ==========================================

router.get(
  "/users",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .populate("charity", "name")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("Get admin users error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load users",
      });
    }
  }
);

// ==========================================
// ACTIVATE / DEACTIVATE USER
// PATCH /api/admin/users/:id/status
// ==========================================

router.patch(
  "/users/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false",
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Admin cannot deactivate himself
      if (String(user._id) === String(req.user.id)) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot deactivate your own admin account",
        });
      }

      user.isActive = isActive;

      await user.save();

      const updatedUser = await User.findById(user._id)
        .select("-password")
        .populate("charity", "name");

      return res.json({
        success: true,
        message: isActive
          ? "User activated successfully"
          : "User deactivated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update user status error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update user status",
      });
    }
  }
);

// ==========================================
// MAKE ADMIN / REMOVE ADMIN
// PATCH /api/admin/users/:id/admin
// ==========================================

router.patch(
  "/users/:id/admin",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { isAdmin } = req.body;

      if (typeof isAdmin !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isAdmin must be true or false",
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Admin cannot remove his own admin access
      if (
        String(user._id) === String(req.user.id) &&
        isAdmin === false
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot remove admin access from yourself",
        });
      }

      user.isAdmin = isAdmin;

      await user.save();

      const updatedUser = await User.findById(user._id)
        .select("-password")
        .populate("charity", "name");

      return res.json({
        success: true,
        message: isAdmin
          ? "Admin access granted successfully"
          : "Admin access removed successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update admin role error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update admin role",
      });
    }
  }
);

// ======================================================
// GET ALL WINNERS
// GET /api/admin/winners
// ======================================================

router.get(
  "/winners",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const winners = await Winner.find()
        .populate("user", "name email")
        .populate(
          "draw",
          "month year status numbers prizePool jackpot"
        )
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        winners,
      });
    } catch (error) {
      console.error(
        "Get admin winners error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to load winners",
      });
    }
  }
);

// ======================================================
// UPDATE WINNER VERIFICATION
// PATCH /api/admin/winners/:id/verification
// ======================================================

router.patch(
  "/winners/:id/verification",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { verificationStatus } = req.body;

      const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
      ];

      if (
        !allowedStatuses.includes(
          verificationStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification status",
        });
      }

      const winner = await Winner.findById(
        req.params.id
      );

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Winner not found",
        });
      }

      winner.verificationStatus =
        verificationStatus;

      if (
        verificationStatus === "approved"
      ) {
        winner.verifiedAt = new Date();
      } else {
        winner.verifiedAt = null;
      }

      await winner.save();

      const updatedWinner =
        await Winner.findById(winner._id)
          .populate("user", "name email")
          .populate(
            "draw",
            "month year status numbers prizePool jackpot"
          );

      return res.json({
        success: true,
        message:
          "Winner verification updated successfully",
        winner: updatedWinner,
      });
    } catch (error) {
      console.error(
        "Update winner verification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update winner verification",
      });
    }
  }
);

// ======================================================
// MARK WINNER AS PAID
// PATCH /api/admin/winners/:id/payout
// ======================================================

router.patch(
  "/winners/:id/payout",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const winner = await Winner.findById(
        req.params.id
      );

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
            "Winner must be approved before payout",
        });
      }

      // Already paid
      if (winner.payoutStatus === "paid") {
        return res.status(400).json({
          success: false,
          message:
            "Prize has already been paid",
        });
      }

      winner.payoutStatus = "paid";
      winner.paidAt = new Date();

      await winner.save();

      const updatedWinner =
        await Winner.findById(winner._id)
          .populate("user", "name email")
          .populate(
            "draw",
            "month year status numbers prizePool jackpot"
          );

      return res.json({
        success: true,
        message:
          "Prize marked as paid successfully",
        winner: updatedWinner,
      });
    } catch (error) {
      console.error(
        "Mark winner payout error:",
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