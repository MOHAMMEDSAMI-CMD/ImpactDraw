import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// HELPER
// ==========================================

function getUserId(req) {
  return req.user?._id || req.user?.id;
}

// ==========================================
// GET LATEST 5 SCORES
// GET /api/scores
// ==========================================

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);

    console.log("SCORES USER ID:", userId);
    console.log(
      "AUTH USER:",
      req.user?.name,
      req.user?.email
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication",
      });
    }

    const user = await User.findById(userId).select("scores");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("FOUND USER SCORES:", user.scores);

    const scores = [...user.scores]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 5);

    console.log("FINAL SCORES:", scores);

    res.json({
      success: true,
      scores,
    });
  } catch (error) {
    console.error("Get scores error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load scores",
    });
  }
});

// ==========================================
// ADD SCORE
// POST /api/scores
// ==========================================

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);

    console.log("ADD SCORE USER ID:", userId);
    console.log("ADD SCORE BODY:", req.body);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication",
      });
    }

    const { score, value, date } = req.body;

    // Support both score and value
    const numericScore = Number(
      score !== undefined ? score : value
    );

    // Validate score
    if (
      Number.isNaN(numericScore) ||
      numericScore < 1 ||
      numericScore > 45
    ) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 1 and 45",
      });
    }

    // Validate date
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const scoreDate = new Date(date);

    if (Number.isNaN(scoreDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("BEFORE SCORES:", user.scores);

    // Add score
    user.scores.push({
      score: numericScore,
      date: scoreDate,
    });

    console.log("AFTER SCORES:", user.scores);

    // Newest first
    user.scores.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

    // Keep latest 5
    if (user.scores.length > 5) {
      user.scores = user.scores.slice(0, 5);
    }

    await user.save();

    console.log("SAVED SCORES:", user.scores);

    res.status(201).json({
      success: true,
      message: "Score added successfully",
      scores: user.scores,
    });
  } catch (error) {
    console.error("Add score error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add score",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

// ==========================================
// UPDATE SCORE
// PUT /api/scores/:id
// ==========================================

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication",
      });
    }

    const { score, value, date } = req.body;

    const numericScore = Number(
      score !== undefined ? score : value
    );

    if (
      Number.isNaN(numericScore) ||
      numericScore < 1 ||
      numericScore > 45
    ) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 1 and 45",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const scoreDate = new Date(date);

    if (Number.isNaN(scoreDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const scoreItem = user.scores.id(req.params.id);

    if (!scoreItem) {
      return res.status(404).json({
        success: false,
        message: "Score not found",
      });
    }

    scoreItem.score = numericScore;
    scoreItem.date = scoreDate;

    user.scores.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

    user.scores = user.scores.slice(0, 5);

    await user.save();

    res.json({
      success: true,
      message: "Score updated successfully",
      scores: user.scores,
    });
  } catch (error) {
    console.error("Update score error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update score",
    });
  }
});

// ==========================================
// DELETE SCORE
// DELETE /api/scores/:id
// ==========================================

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const scoreItem = user.scores.id(req.params.id);

    if (!scoreItem) {
      return res.status(404).json({
        success: false,
        message: "Score not found",
      });
    }

    user.scores.pull(req.params.id);

    await user.save();

    res.json({
      success: true,
      message: "Score deleted successfully",
      scores: user.scores,
    });
  } catch (error) {
    console.error("Delete score error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete score",
    });
  }
});

export default router;