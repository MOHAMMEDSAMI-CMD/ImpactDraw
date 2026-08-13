import express from "express";
import User from "../models/User.js";
import Draw from "../models/Draw.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/admin/stats
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();

    // Active subscribers
    const activeSubscribers = await User.countDocuments({
      subscriptionStatus: "active",
      isActive: true,
    });

    // Current month/year
    const now = new Date();

    const month = now.toLocaleString("en-US", {
      month: "long",
    });

    const year = now.getFullYear();

    // Current draw
    const currentDraw = await Draw.findOne({
      month,
      year,
    });

    // Prize pool
    const prizePool = currentDraw?.prizePool || 0;

    // Demo/business calculation:
    // ₹100 contribution per active subscriber
    const monthlyRevenue = activeSubscribers * 100;

    // 10% charity contribution
    const charityContributions = activeSubscribers * 10;

    res.json({
      success: true,

      stats: {
        totalUsers,
        activeSubscribers,
        prizePool,
        charityContributions,
        monthlyRevenue,
      },

      currentDraw: currentDraw
        ? {
            id: currentDraw._id,
            month: `${currentDraw.month} ${currentDraw.year}`,
            eligibleSubscribers:
              currentDraw.eligibleSubscribers,
            prizePool: currentDraw.prizePool,
            jackpot: currentDraw.jackpot,
            status: currentDraw.status,
            numbers: currentDraw.numbers,
            publishedAt: currentDraw.publishedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load admin statistics",
    });
  }
});

export default router;