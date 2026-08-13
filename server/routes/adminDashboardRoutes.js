import express from "express";

import User from "../models/User.js";
import Charity from "../models/Charity.js";
import Draw from "../models/Draw.js";
import Winner from "../models/Winner.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// =====================================================
// GET DASHBOARD / REPORT DATA
// =====================================================

const getDashboardData = async () => {
  // ===================================================
  // USERS
  // ===================================================

  const totalUsers = await User.countDocuments();

  const activeUsers = await User.countDocuments({
    isActive: true,
  });

  const activeSubscribers = await User.countDocuments({
    isActive: true,
    subscriptionStatus: "active",
  });

  // ===================================================
  // CHARITIES
  // ===================================================

  const totalCharities = await Charity.countDocuments();

  // ===================================================
  // DRAWS
  // ===================================================

  const totalDraws = await Draw.countDocuments();

  const publishedDraws = await Draw.countDocuments({
    status: "published",
  });

  const drawFinancials = await Draw.aggregate([
    {
      $group: {
        _id: null,

        totalPrizePool: {
          $sum: {
            $ifNull: ["$prizePool", 0],
          },
        },

        totalJackpot: {
          $sum: {
            $ifNull: ["$jackpot", 0],
          },
        },
      },
    },
  ]);

  const totalPrizePool =
    drawFinancials[0]?.totalPrizePool || 0;

  const totalJackpot =
    drawFinancials[0]?.totalJackpot || 0;

  // ===================================================
  // WINNERS
  // ===================================================

  const totalWinners = await Winner.countDocuments();

  const approvedWinners =
    await Winner.countDocuments({
      verificationStatus: "approved",
    });

  const pendingVerification =
    await Winner.countDocuments({
      verificationStatus: {
        $ne: "approved",
      },
    });

  const paidWinners =
    await Winner.countDocuments({
      payoutStatus: "paid",
    });

  const pendingPayoutWinners =
    await Winner.countDocuments({
      payoutStatus: {
        $ne: "paid",
      },
    });

  // ===================================================
  // PRIZES
  // ===================================================

  const prizeStats = await Winner.aggregate([
    {
      $group: {
        _id: null,

        totalPrize: {
          $sum: {
            $ifNull: ["$prize", 0],
          },
        },

        paidPrize: {
          $sum: {
            $cond: [
              {
                $eq: ["$payoutStatus", "paid"],
              },
              {
                $ifNull: ["$prize", 0],
              },
              0,
            ],
          },
        },

        pendingPrize: {
          $sum: {
            $cond: [
              {
                $ne: ["$payoutStatus", "paid"],
              },
              {
                $ifNull: ["$prize", 0],
              },
              0,
            ],
          },
        },
      },
    },
  ]);

  const totalPrize =
    prizeStats[0]?.totalPrize || 0;

  const paidPrize =
    prizeStats[0]?.paidPrize || 0;

  const pendingPrize =
    prizeStats[0]?.pendingPrize || 0;

  // ===================================================
  // MATCH SUMMARY
  // ===================================================

  const matchSummary = {};

  const fiveNumber = await Winner.aggregate([
    {
      $match: {
        matchType: "5-number",
      },
    },
    {
      $group: {
        _id: null,

        count: {
          $sum: 1,
        },

        prize: {
          $sum: {
            $ifNull: ["$prize", 0],
          },
        },
      },
    },
  ]);

  const fourNumber = await Winner.aggregate([
    {
      $match: {
        matchType: "4-number",
      },
    },
    {
      $group: {
        _id: null,

        count: {
          $sum: 1,
        },

        prize: {
          $sum: {
            $ifNull: ["$prize", 0],
          },
        },
      },
    },
  ]);

  const threeNumber = await Winner.aggregate([
    {
      $match: {
        matchType: "3-number",
      },
    },
    {
      $group: {
        _id: null,

        count: {
          $sum: 1,
        },

        prize: {
          $sum: {
            $ifNull: ["$prize", 0],
          },
        },
      },
    },
  ]);

  matchSummary.fiveNumber = {
    count: fiveNumber[0]?.count || 0,
    prize: fiveNumber[0]?.prize || 0,
  };

  matchSummary.fourNumber = {
    count: fourNumber[0]?.count || 0,
    prize: fourNumber[0]?.prize || 0,
  };

  matchSummary.threeNumber = {
    count: threeNumber[0]?.count || 0,
    prize: threeNumber[0]?.prize || 0,
  };

  // ===================================================
  // RECENT DRAWS
  // ===================================================

  const recentDraws = await Draw.find()
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .lean();

  // ===================================================
  // RECENT WINNERS
  // ===================================================

  const recentWinners = await Winner.find()
    .populate(
      "user",
      "name email"
    )
    .populate(
      "draw",
      "month year numbers prizePool jackpot status publishedAt"
    )
    .sort({
      createdAt: -1,
    })
    .limit(10)
    .lean();

  // ===================================================
  // RETURN DATA
  // ===================================================

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      activeSubscribers,
    },

    charities: {
      total: totalCharities,
    },

    draws: {
      total: totalDraws,
      published: publishedDraws,
      totalPrizePool,
      totalJackpot,
    },

    winners: {
      total: totalWinners,
      approved: approvedWinners,
      pendingVerification,
      paid: paidWinners,
      pendingPayout: pendingPayoutWinners,
    },

    prizes: {
      total: totalPrize,
      paid: paidPrize,
      pending: pendingPrize,
    },

    matchSummary,

    recentDraws,

    recentWinners,
  };
};

// =====================================================
// ADMIN DASHBOARD STATS
// GET /api/admin/dashboard/stats
// =====================================================

router.get(
  "/stats",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const data = await getDashboardData();

      res.json({
        success: true,
        ...data,
      });
    } catch (error) {
      console.error(
        "Admin dashboard stats error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load admin dashboard statistics",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
);

// =====================================================
// ADMIN REPORTS
// GET /api/admin/dashboard/reports
// =====================================================

router.get(
  "/reports",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const data = await getDashboardData();

      res.json({
        success: true,
        ...data,
      });
    } catch (error) {
      console.error(
        "Admin reports error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to load reports",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
);

// =====================================================
// TEST ROUTE
// GET /api/admin/dashboard
// =====================================================

router.get(
  "/",
  requireAuth,
  requireAdmin,
  (req, res) => {
    res.json({
      success: true,
      message:
        "Admin dashboard route is working",
    });
  }
);

export default router;