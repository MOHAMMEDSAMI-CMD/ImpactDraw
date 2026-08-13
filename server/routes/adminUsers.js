import express from "express";
import User from "../models/User.js";

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
  "/",
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
      console.error(
        "Get admin users error:",
        error
      );

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
  "/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { isActive } = req.body;

      // Validate boolean
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be true or false",
        });
      }

      // Find user
      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // ========================================
      // PREVENT SELF DEACTIVATION
      // ========================================

      if (
        String(user._id) ===
        String(req.user.id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot deactivate your own admin account",
        });
      }

      // ========================================
      // UPDATE STATUS
      // ========================================

      user.isActive = isActive;

      await user.save();

      // ========================================
      // GET UPDATED USER
      // ========================================

      const updatedUser =
        await User.findById(user._id)
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
      console.error(
        "Update user status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update user status",
      });
    }
  }
);

// ==========================================
// MAKE ADMIN / REMOVE ADMIN
// PATCH /api/admin/users/:id/admin
// ==========================================

router.patch(
  "/:id/admin",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { isAdmin } = req.body;

      // Validate boolean
      if (typeof isAdmin !== "boolean") {
        return res.status(400).json({
          success: false,
          message:
            "isAdmin must be true or false",
        });
      }

      // Find user
      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // ========================================
      // PREVENT REMOVING OWN ADMIN ACCESS
      // ========================================

      if (
        String(user._id) ===
          String(req.user.id) &&
        isAdmin === false
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot remove admin access from yourself",
        });
      }

      // ========================================
      // UPDATE ADMIN ROLE
      // ========================================

      user.isAdmin = isAdmin;

      await user.save();

      // ========================================
      // GET UPDATED USER
      // ========================================

      const updatedUser =
        await User.findById(user._id)
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
      console.error(
        "Update admin role error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update admin role",
      });
    }
  }
);

export default router;