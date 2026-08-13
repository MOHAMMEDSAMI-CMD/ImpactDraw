import express from "express";
import Draw from "../models/Draw.js";
import Winner from "../models/Winner.js";

const router = express.Router();


// ==========================================
// GET LATEST PUBLISHED DRAW
// GET /api/draws/latest
// ==========================================

router.get("/latest", async (req, res) => {
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

    const five = winners.filter(
      (w) => w.matchType === "5-number"
    ).length;

    const four = winners.filter(
      (w) => w.matchType === "4-number"
    ).length;

    const three = winners.filter(
      (w) => w.matchType === "3-number"
    ).length;

    res.json({
      success: true,

      draw,

      winners,

      winnerCounts: {
        five,
        four,
        three,
        total: winners.length,
      },

      prizeDistribution: {
        fiveNumber: {
          count: five,
          prizePerWinner:
            draw.jackpot || 0,
          totalPrize:
            five * (draw.jackpot || 0),
        },

        fourNumber: {
          count: four,
          prizePerWinner:
            (draw.prizePool || 0) * 0.35,
          totalPrize:
            four *
            (draw.prizePool || 0) *
            0.35,
        },

        threeNumber: {
          count: three,
          prizePerWinner:
            (draw.prizePool || 0) * 0.25,
          totalPrize:
            three *
            (draw.prizePool || 0) *
            0.25,
        },
      },
    });
  } catch (error) {
    console.error(
      "Latest draw error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load latest draw",
    });
  }
});


// ==========================================
// GET DRAW HISTORY
// GET /api/draws/history
// ==========================================

router.get("/history", async (req, res) => {
  try {
    const draws = await Draw.find({
      status: "published",
    })
      .sort({
        publishedAt: -1,
      })
      .lean();

    const result = await Promise.all(
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

    res.json({
      success: true,
      draws: result,
    });
  } catch (error) {
    console.error(
      "Draw history error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load draw history",
    });
  }
});

export default router;