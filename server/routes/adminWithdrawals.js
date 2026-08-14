import express from "express";

import Withdrawal from "../models/Withdrawal.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// =====================================================
// GET ALL WITHDRAWALS
// GET /api/admin/withdrawals
// =====================================================

router.get(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const withdrawals =
        await Withdrawal.find()
          .populate(
            "user",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        withdrawals,
      });
    } catch (error) {
      console.error(
        "GET ADMIN WITHDRAWALS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load withdrawals",
      });
    }
  }
);

// =====================================================
// UPDATE WITHDRAWAL
// PATCH /api/admin/withdrawals/:id
// =====================================================

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { status, rejectionReason } =
        req.body;

      const validStatuses = [
        "approved",
        "rejected",
        "paid",
      ];

      if (
        !validStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid withdrawal status",
        });
      }

      const withdrawal =
        await Withdrawal.findById(
          req.params.id
        );

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message:
            "Withdrawal not found",
        });
      }

      // =========================
      // ALREADY FINAL
      // =========================

      if (
        withdrawal.status === "paid" ||
        withdrawal.status === "rejected"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Withdrawal is already ${withdrawal.status}`,
        });
      }

      // =========================
      // PAY
      // =========================

      if (status === "paid") {
        if (
          withdrawal.status !==
          "approved"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Withdrawal must be approved before payment",
          });
        }
      }

      // =========================
      // REJECT + REFUND
      // =========================

      if (status === "rejected") {
        const wallet =
          await Wallet.findOne({
            user: withdrawal.user,
          });

        if (!wallet) {
          return res.status(404).json({
            success: false,
            message:
              "User wallet not found",
          });
        }

        wallet.balance +=
          Number(withdrawal.amount);

        await wallet.save();

        await Transaction.create({
          user: withdrawal.user,

          type: "credit",

          amount:
            Number(withdrawal.amount),

          description:
            "Withdrawal rejected - refund",

          status: "completed",

          reference: withdrawal._id,

          referenceType: "Withdrawal",
        });
      }

      // =========================
      // UPDATE WITHDRAWAL
      // =========================

      withdrawal.status = status;

      if (status === "rejected") {
        withdrawal.rejectionReason =
          rejectionReason || "";
      }

      if (
        status === "approved" ||
        status === "paid" ||
        status === "rejected"
      ) {
        withdrawal.processedAt =
          new Date();
      }

      await withdrawal.save();

      // =========================
      // ORIGINAL TRANSACTION
      // =========================

      const transaction =
        await Transaction.findOne({
          reference:
            withdrawal._id,

          referenceType:
            "Withdrawal",

          type: "debit",
        });

      if (transaction) {
        if (status === "approved") {
          transaction.status =
            "pending";
        }

        if (status === "paid") {
          transaction.status =
            "completed";
        }

        if (status === "rejected") {
          transaction.status =
            "failed";
        }

        await transaction.save();
      }

      return res.json({
        success: true,

        message:
          "Withdrawal updated successfully",

        withdrawal,
      });
    } catch (error) {
      console.error(
        "UPDATE WITHDRAWAL ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Update failed",
      });
    }
  }
);

export default router;