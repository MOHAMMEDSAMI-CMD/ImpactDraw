import express from "express";
import Draw from "../models/Draw.js";
import User from "../models/User.js";
import Winner from "../models/Winner.js";
import DrawEntry from "../models/DrawEntry.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// HELPERS
// ==========================================

function getCurrentMonthYear() {
  const now = new Date();

  return {
    month: now.toLocaleString("en-US", {
      month: "long",
    }),
    year: now.getFullYear(),
  };
}

function generateRandomNumbers() {
  const numbers = new Set();

  while (numbers.size < 5) {
    numbers.add(
      Math.floor(Math.random() * 45) + 1
    );
  }

  return [...numbers].sort((a, b) => a - b);
}

async function getOrCreateCurrentDraw() {
  const { month, year } = getCurrentMonthYear();

  let draw = await Draw.findOne({
    month,
    year,
  });

  if (draw) {
    return draw;
  }

  const eligibleSubscribers =
    await User.countDocuments({
      subscriptionStatus: "active",
      isActive: true,
    });

  const prizePool = eligibleSubscribers * 100;

  draw = await Draw.create({
    month,
    year,
    eligibleSubscribers,
    prizePool,
    jackpot: prizePool * 0.4,
    numbers: [],
    status: "pending",
  });

  return draw;
}

// ==========================================
// GET CURRENT DRAW
// GET /api/admin/draws/current
// ==========================================

router.get(
  "/current",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const draw =
        await getOrCreateCurrentDraw();

      return res.json({
        success: true,
        draw,
      });
    } catch (error) {
      console.error(
        "Get current draw error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load current draw",
      });
    }
  }
);

// ==========================================
// SIMULATE DRAW
// POST /api/admin/draws/simulate
// ==========================================

router.post(
  "/simulate",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const draw =
        await getOrCreateCurrentDraw();

      if (draw.status === "published") {
        return res.status(400).json({
          success: false,
          message:
            "Draw is already published",
        });
      }

      const numbers =
        generateRandomNumbers();

      draw.numbers = numbers;
      draw.status = "simulated";

      await draw.save();

      return res.json({
        success: true,
        message:
          "Draw simulated successfully",

        drawId: draw._id,

        numbers,

        eligibleSubscribers:
          draw.eligibleSubscribers,

        prizePool:
          draw.prizePool,

        jackpot:
          draw.jackpot,

        matches: {
          five: 0,
          four: 0,
          three: 0,
        },

        prizeDistribution: {
          fiveNumber: {
            count: 0,
            prizePerWinner:
              draw.jackpot,
            totalPrize: 0,
          },

          fourNumber: {
            count: 0,
            prizePerWinner:
              draw.prizePool * 0.35,
            totalPrize: 0,
          },

          threeNumber: {
            count: 0,
            prizePerWinner:
              draw.prizePool * 0.25,
            totalPrize: 0,
          },
        },

        draw,
      });
    } catch (error) {
      console.error(
        "Simulate draw error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to simulate draw",
      });
    }
  }
);

// ==========================================
// PUBLISH DRAW
// POST /api/admin/draws/publish
// ==========================================

router.post(
  "/publish",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        drawId,
        numbers,
      } = req.body;

      if (!drawId) {
        return res.status(400).json({
          success: false,
          message: "Draw ID is required",
        });
      }

      const draw =
        await Draw.findById(drawId);

      if (!draw) {
        return res.status(404).json({
          success: false,
          message: "Draw not found",
        });
      }

      if (draw.status === "published") {
        return res.status(400).json({
          success: false,
          message:
            "Draw is already published",
        });
      }

      if (
        !Array.isArray(numbers) ||
        numbers.length !== 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Exactly 5 winning numbers are required",
        });
      }

      const winningNumbers =
        numbers.map(Number);

      const invalidNumber =
        winningNumbers.some(
          (number) =>
            !Number.isInteger(number) ||
            number < 1 ||
            number > 45
        );

      if (invalidNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Winning numbers must be between 1 and 45",
        });
      }

      if (
        new Set(winningNumbers).size !== 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Winning numbers must be unique",
        });
      }

      winningNumbers.sort(
        (a, b) => a - b
      );

      draw.numbers = winningNumbers;
      draw.status = "published";
      draw.publishedAt = new Date();

      await draw.save();

      return res.json({
        success: true,
        message:
          "Draw published successfully",
        drawId: draw._id,
        numbers: winningNumbers,
        draw,
      });
    } catch (error) {
      console.error(
        "Publish draw error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to publish draw",
      });
    }
  }
);

// ==========================================
// CALCULATE WINNERS
// POST /api/admin/draws/:drawId/calculate-winners
// ==========================================

router.post(
  "/:drawId/calculate-winners",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { drawId } = req.params;

      const draw =
        await Draw.findById(drawId);

      if (!draw) {
        return res.status(404).json({
          success: false,
          message: "Draw not found",
        });
      }

      if (draw.status !== "published") {
        return res.status(400).json({
          success: false,
          message:
            "Draw is not published yet",
        });
      }

      if (
        !Array.isArray(draw.numbers) ||
        draw.numbers.length !== 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Draw does not have valid winning numbers",
        });
      }

      const entries =
        await DrawEntry.find({
          draw: draw._id,
        });

      const winners = [];

      for (const entry of entries) {
        const userNumbers =
          entry.numbers.map(Number);

        const matchedNumbers =
          draw.numbers.filter((number) =>
            userNumbers.includes(number)
          );

        const matchCount =
          matchedNumbers.length;

        let matchType = null;
        let prize = 0;

        if (matchCount === 5) {
          matchType = "5-number";
          prize = draw.jackpot;
        } else if (matchCount === 4) {
          matchType = "4-number";
          prize =
            draw.prizePool * 0.35;
        } else if (matchCount === 3) {
          matchType = "3-number";
          prize =
            draw.prizePool * 0.25;
        }

        if (!matchType) {
          continue;
        }

        const existingWinner =
          await Winner.findOne({
            user: entry.user,
            draw: draw._id,
          });

        if (existingWinner) {
          continue;
        }

        const winner =
          await Winner.create({
            user: entry.user,
            draw: draw._id,
            numbers: userNumbers,
            matchedNumbers,
            matchType,
            prize,
            proofUrl: "",
            verificationStatus:
              "pending",
            payoutStatus:
              "pending",
            verifiedAt: null,
            paidAt: null,
          });

        winners.push(winner);
      }

      return res.json({
        success: true,

        message:
          winners.length > 0
            ? "Winners calculated successfully"
            : "Winner calculation completed. No winners found.",

        winners,
      });
    } catch (error) {
      console.error(
        "Calculate winners error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to calculate winners",
      });
    }
  }
);

// ==========================================
// GET ALL DRAWS
// GET /api/admin/draws
// ==========================================

router.get(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const draws =
        await Draw.find()
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        draws,
      });
    } catch (error) {
      console.error(
        "Get all draws error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load draws",
      });
    }
  }
);

export default router;