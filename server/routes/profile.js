import express from "express";
import User from "../models/User.js";
import {
  requireAuth,
} from "../middleware/auth.js";

const router = express.Router();

// PATCH /api/profile
router.patch("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { charity, charityPercentage } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Charity
    if (charity !== undefined) {
      user.charity = charity || null;
    }

    // Charity percentage
    if (charityPercentage !== undefined) {
      const percentage = Number(charityPercentage);

      if (
        Number.isNaN(percentage) ||
        percentage < 10 ||
        percentage > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Charity percentage must be between 10 and 100.",
        });
      }

      user.charityPercentage = percentage;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate("charity");

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PATCH PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
      error: error.message,
    });
  }
});

export default router;