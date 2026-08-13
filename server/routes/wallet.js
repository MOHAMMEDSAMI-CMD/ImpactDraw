import express from "express";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// GET WALLET
// GET /api/wallet
// ==========================================

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    let wallet = await Wallet.findOne({
      user: userId,
    });

    // Create wallet automatically if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
      });
    }

    return res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error("Get wallet error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load wallet",
    });
  }
});

// ==========================================
// GET TRANSACTIONS
// GET /api/wallet/transactions
// ==========================================

router.get(
  "/transactions",
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const transactions = await Transaction.find({
        user: userId,
      })
        .populate(
          "reference",
          "matchType prize draw"
        )
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        transactions,
      });
    } catch (error) {
      console.error("Get transactions error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load transactions",
      });
    }
  }
);

export default router;