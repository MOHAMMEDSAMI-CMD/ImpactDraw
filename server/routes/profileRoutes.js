import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// GET CURRENT PROFILE
// GET /api/profile
// ==========================================

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("charity")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile.",
      error: error.message,
    });
  }
});

// ==========================================
// UPDATE PROFILE
// PATCH /api/profile
// ==========================================

router.patch("/", requireAuth, async (req, res) => {
  try {
    console.log("PROFILE BODY:", req.body);

    const {
      charity,
      charityPercentage,
    } = req.body || {};

    const updateData = {};

    // Charity
    if (charity !== undefined) {
      updateData.charity =
        charity === "" || charity === null
          ? null
          : charity;
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

      updateData.charityPercentage = percentage;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No profile data provided.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("charity")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
      error: error.message,
    });
  }
});

export default router;