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

// Generate 5 unique numbers between 1 and 45
function generateRandomNumbers() {
  const numbers = new Set();

  while (numbers.size < 5) {
    numbers.add(
      Math.floor(Math.random() * 45) + 1
    );
  }

  return [...numbers].sort(
    (a, b) => a - b
  );
}

// ==========================================
// GET OR CREATE CURRENT DRAW
// ==========================================

async function getOrCreateCurrentDraw() {
  const { month, year } =
    getCurrentMonthYear();

  let draw = await Draw.findOne({
    month,
    year,
  });

  if (draw) {
    return draw;
  }

  // Active subscribers
  const eligibleSubscribers =
    await User.countDocuments({
      subscriptionStatus: "active",
      isActive: true,
    });

  // ₹100 per subscriber
  const prizePool =
    eligibleSubscribers * 100;

  // 40% jackpot
  const jackpot =
    prizePool * 0.4;

  draw = await Draw.create({
    month,
    year,
    eligibleSubscribers,
    prizePool,
    jackpot,
    numbers: [],
    status: "open",
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

        mode: draw.mode,

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

      // --------------------------------------
      // Validate draw ID
      // --------------------------------------

      if (!drawId) {
        return res.status(400).json({
          success: false,
          message:
            "Draw ID is required",
        });
      }

      // --------------------------------------
      // Find draw
      // --------------------------------------

      const draw =
        await Draw.findById(drawId);

      if (!draw) {
        return res.status(404).json({
          success: false,
          message: "Draw not found",
        });
      }

      // --------------------------------------
      // Already published
      // --------------------------------------

      if (draw.status === "published") {
        return res.status(400).json({
          success: false,
          message:
            "Draw is already published",
        });
      }

      // --------------------------------------
      // Validate numbers
      // --------------------------------------

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

      // --------------------------------------
      // Validate number range
      // --------------------------------------

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

      // --------------------------------------
      // Unique numbers
      // --------------------------------------

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

      // --------------------------------------
      // Save draw
      // --------------------------------------

      draw.numbers =
        winningNumbers;

      draw.status =
        "published";

      draw.publishedAt =
        new Date();

      await draw.save();

      // ======================================
      // FIND DRAW ENTRIES
      // ======================================

      const entries =
        await DrawEntry.find({
          draw: draw._id,
        });

      let fiveWinners = 0;
      let fourWinners = 0;
      let threeWinners = 0;

      const createdWinners = [];

      // ======================================
      // CHECK EVERY ENTRY
      // ======================================

      for (const entry of entries) {
        const userNumbers =
          entry.numbers.map(Number);

        const matchedNumbers =
          winningNumbers.filter(
            (number) =>
              userNumbers.includes(number)
          );

        const matchCount =
          matchedNumbers.length;

        let matchType = null;
        let prize = 0;

        // ------------------------------------
        // 5 NUMBER
        // ------------------------------------

        if (matchCount === 5) {
          matchType =
            "5-number";

          prize =
            draw.jackpot;

          fiveWinners++;
        }

        // ------------------------------------
        // 4 NUMBER
        // ------------------------------------

        else if (matchCount === 4) {
          matchType =
            "4-number";

          prize =
            draw.prizePool * 0.35;

          fourWinners++;
        }

        // ------------------------------------
        // 3 NUMBER
        // ------------------------------------

        else if (matchCount === 3) {
          matchType =
            "3-number";

          prize =
            draw.prizePool * 0.25;

          threeWinners++;
        }

        // No prize
        if (!matchType) {
          continue;
        }

        // ====================================
        // CHECK EXISTING WINNER
        // ====================================

        const existingWinner =
          await Winner.findOne({
            user: entry.user,
            draw: draw._id,
          });

        if (existingWinner) {
          continue;
        }

        // ====================================
        // CREATE WINNER
        // ====================================

        const winner =
          await Winner.create({
            user: entry.user,

            draw: draw._id,

            numbers:
              userNumbers,

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

        createdWinners.push(
          winner
        );
      }

      // ======================================
      // TOTAL WINNERS
      // ======================================

      const totalWinners =
        fiveWinners +
        fourWinners +
        threeWinners;

      // ======================================
      // RESPONSE
      // ======================================

      return res.json({
        success: true,

        message:
          "Draw published successfully",

        drawId:
          draw._id,

        numbers:
          winningNumbers,

        winnerCreated:
          createdWinners.length,

        matches: {
          five: fiveWinners,
          four: fourWinners,
          three: threeWinners,
        },

        totalWinners,

        prizeDistribution: {
          fiveNumber: {
            count:
              fiveWinners,

            prizePerWinner:
              draw.jackpot,

            totalPrize:
              fiveWinners *
              draw.jackpot,
          },

          fourNumber: {
            count:
              fourWinners,

            prizePerWinner:
              draw.prizePool * 0.35,

            totalPrize:
              fourWinners *
              draw.prizePool *
              0.35,
          },

          threeNumber: {
            count:
              threeWinners,

            prizePerWinner:
              draw.prizePool * 0.25,

            totalPrize:
              threeWinners *
              draw.prizePool *
              0.25,
          },
        },

        winners:
          createdWinners,

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
// CALCULATE / RECALCULATE WINNERS
// POST /api/admin/draws/:drawId/calculate-winners
// ==========================================

router.post(
  "/:drawId/calculate-winners",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { drawId } =
        req.params;

      // --------------------------------------
      // Find draw
      // --------------------------------------

      const draw =
        await Draw.findById(drawId);

      if (!draw) {
        return res.status(404).json({
          success: false,
          message:
            "Draw not found",
        });
      }

      // --------------------------------------
      // Must be published
      // --------------------------------------

      if (
        draw.status !== "published"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Draw is not published yet",
        });
      }

      // --------------------------------------
      // Validate winning numbers
      // --------------------------------------

      if (
        !Array.isArray(
          draw.numbers
        ) ||
        draw.numbers.length !== 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Draw does not have valid winning numbers",
        });
      }

      // --------------------------------------
      // Get entries
      // --------------------------------------

      const entries =
        await DrawEntry.find({
          draw: draw._id,
        });

      const winners = [];

      // ======================================
      // CHECK EVERY ENTRY
      // ======================================

      for (const entry of entries) {
        const userNumbers =
          entry.numbers.map(Number);

        const matchedNumbers =
          draw.numbers.filter(
            (number) =>
              userNumbers.includes(number)
          );

        const matchCount =
          matchedNumbers.length;

        let matchType = null;
        let prize = 0;

        if (matchCount === 5) {
          matchType =
            "5-number";

          prize =
            draw.jackpot;
        }

        else if (matchCount === 4) {
          matchType =
            "4-number";

          prize =
            draw.prizePool * 0.35;
        }

        else if (matchCount === 3) {
          matchType =
            "3-number";

          prize =
            draw.prizePool * 0.25;
        }

        if (!matchType) {
          continue;
        }

        // ------------------------------------
        // Prevent duplicate
        // ------------------------------------

        const existingWinner =
          await Winner.findOne({
            user: entry.user,
            draw: draw._id,
          });

        if (existingWinner) {
          continue;
        }

        // ------------------------------------
        // Create winner
        // ------------------------------------

        const winner =
          await Winner.create({
            user: entry.user,

            draw: draw._id,

            numbers:
              userNumbers,

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
            : "Winner calculation completed. No new winners found.",

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

// ==========================================
// PUBLIC - LATEST PUBLISHED DRAW
// GET /api/draws/latest
// ==========================================

router.get(
  "/latest",
  async (req, res) => {
    try {
      const draw = await Draw.findOne({
        status: "published",
      }).sort({
        publishedAt: -1,
      });

      if (!draw) {
        return res.json({
          success: true,
          draw: null,
          winners: [],
          winnerCounts: {
            five: 0,
            four: 0,
            three: 0,
            total: 0,
          },
          prizeDistribution: null,
        });
      }

      const winners = await Winner.find({
        draw: draw._id,
      }).populate(
        "user",
        "name email"
      );

      const fiveWinners = winners.filter(
        (winner) =>
          winner.matchType === "5-number"
      ).length;

      const fourWinners = winners.filter(
        (winner) =>
          winner.matchType === "4-number"
      ).length;

      const threeWinners = winners.filter(
        (winner) =>
          winner.matchType === "3-number"
      ).length;

      return res.json({
        success: true,

        draw,

        winners,

        winnerCounts: {
          five: fiveWinners,
          four: fourWinners,
          three: threeWinners,
          total: winners.length,
        },

        prizeDistribution: {
          fiveNumber: {
            count: fiveWinners,
            prizePerWinner: draw.jackpot || 0,
            totalPrize:
              fiveWinners *
              (draw.jackpot || 0),
          },

          fourNumber: {
            count: fourWinners,
            prizePerWinner:
              (draw.prizePool || 0) * 0.35,
            totalPrize:
              fourWinners *
              (draw.prizePool || 0) *
              0.35,
          },

          threeNumber: {
            count: threeWinners,
            prizePerWinner:
              (draw.prizePool || 0) * 0.25,
            totalPrize:
              threeWinners *
              (draw.prizePool || 0) *
              0.25,
          },
        },
      });
    } catch (error) {
      console.error(
        "Get latest draw error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load latest draw",
      });
    }
  }
);


// ==========================================
// PUBLIC - DRAW HISTORY
// GET /api/draws/history
// ==========================================

router.get(
  "/history",
  async (req, res) => {
    try {
      const draws = await Draw.find({
        status: "published",
      })
        .sort({
          publishedAt: -1,
        })
        .lean();

      // Add winners to every draw
      const drawsWithWinners =
        await Promise.all(
          draws.map(async (draw) => {
            const winners =
              await Winner.find({
                draw: draw._id,
              })
                .populate(
                  "user",
                  "name email"
                )
                .lean();

            return {
              ...draw,
              winners,
            };
          })
        );

      return res.json({
        success: true,
        draws: drawsWithWinners,
      });
    } catch (error) {
      console.error(
        "Get draw history error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load draw history",
      });
    }
  }
);

// ==========================================
// USER - ENTER DRAW
// POST /api/draws/enter
// ==========================================

router.post(
  "/enter",
  requireAuth,
  async (req, res) => {
    try {
      console.log("================================");
      console.log("ENTER DRAW");
      console.log("USER:", req.user);
      console.log("BODY:", req.body);
      console.log(
        "CONTENT TYPE:",
        req.headers["content-type"]
      );

      const { numbers } = req.body || {};

      console.log("NUMBERS:", numbers);

      // -----------------------------
      // Validate numbers
      // -----------------------------

      if (!Array.isArray(numbers)) {
        return res.status(400).json({
          success: false,
          message: "Numbers must be an array",
        });
      }

      if (numbers.length !== 5) {
        return res.status(400).json({
          success: false,
          message:
            "Exactly 5 numbers are required",
        });
      }

      const selectedNumbers =
        numbers.map(Number);

      // -----------------------------
      // Validate range
      // -----------------------------

      const invalidNumber =
        selectedNumbers.some(
          (number) =>
            !Number.isInteger(number) ||
            number < 1 ||
            number > 45
        );

      if (invalidNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Numbers must be between 1 and 45",
        });
      }

      // -----------------------------
      // Validate unique
      // -----------------------------

      if (
        new Set(selectedNumbers).size !== 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Numbers must be unique",
        });
      }

      selectedNumbers.sort(
        (a, b) => a - b
      );

      // -----------------------------
      // Current draw
      // -----------------------------

      const draw =
        await getOrCreateCurrentDraw();

      console.log("CURRENT DRAW:", draw);

      if (!draw) {
        return res.status(404).json({
          success: false,
          message:
            "Current draw not found",
        });
      }

      if (draw.status === "published") {
        return res.status(400).json({
          success: false,
          message:
            "This draw has already been published",
        });
      }

      // -----------------------------
      // USER ID
      // -----------------------------

      const userId =
        req.user?._id || req.user?.id;

      console.log("USER ID:", userId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authenticated user ID not found",
        });
      }

      // -----------------------------
      // Existing entry
      // -----------------------------

      const existingEntry =
        await DrawEntry.findOne({
          user: userId,
          draw: draw._id,
        });

      console.log(
        "EXISTING ENTRY:",
        existingEntry
      );

      if (existingEntry) {
        return res.status(400).json({
          success: false,
          message:
            "You have already entered this draw",
        });
      }

      // -----------------------------
      // Create entry
      // -----------------------------

      const entry =
        await DrawEntry.create({
          user: userId,
          draw: draw._id,
          numbers: selectedNumbers,
        });

      console.log("ENTRY CREATED:", entry);

      return res.status(201).json({
        success: true,
        message:
          "Draw entry submitted successfully",
        entry,
      });
    } catch (error) {
      console.error(
        "================================"
      );

      console.error(
        "ENTER DRAW ERROR:"
      );

      console.error(
        error.stack
      );

      console.error(
        "ERROR MESSAGE:",
        error.message
      );

      console.error(
        "================================"
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to enter draw",
      });
    }
  }
);

export default router