
import express from "express";
import Charity from "../models/Charity.js";
import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// GET ALL CHARITIES
// GET /api/charities
// ==========================================

router.get("/", async (req, res) => {
  try {
    const charities = await Charity.find().sort({
      featured: -1,
      createdAt: -1,
    });

    res.json(charities);
  } catch (error) {
    console.error(
      "Get charities error:",
      error
    );

    res.status(500).json({
      message: "Failed to load charities",
    });
  }
});

// ==========================================
// GET SINGLE CHARITY
// GET /api/charities/:id
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const charity = await Charity.findById(
      req.params.id
    );

    if (!charity) {
      return res.status(404).json({
        message: "Charity not found",
      });
    }

    res.json(charity);
  } catch (error) {
    console.error(
      "Get charity error:",
      error
    );

    res.status(500).json({
      message: "Failed to load charity",
    });
  }
});

// ==========================================
// CREATE CHARITY - ADMIN ONLY
// POST /api/charities
// ==========================================

router.post(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        description,
        image,
        website,
        featured,
        upcomingEvents,
      } = req.body;

      if (!name || !description) {
        return res.status(400).json({
          message:
            "Name and description are required",
        });
      }

      const charity = await Charity.create({
        name,
        description,
        image,
        website,
        featured: featured || false,
        upcomingEvents:
          upcomingEvents || [],
      });

      res.status(201).json(charity);
    } catch (error) {
      console.error(
        "Create charity error:",
        error
      );

      res.status(400).json({
        message: error.message,
      });
    }
  }
);

// ==========================================
// UPDATE CHARITY - ADMIN ONLY
// PUT /api/charities/:id
// ==========================================

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const charity =
        await Charity.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!charity) {
        return res.status(404).json({
          message: "Charity not found",
        });
      }

      res.json(charity);
    } catch (error) {
      console.error(
        "Update charity error:",
        error
      );

      res.status(400).json({
        message: error.message,
      });
    }
  }
);

// ==========================================
// DELETE CHARITY - ADMIN ONLY
// DELETE /api/charities/:id
// ==========================================

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const charity =
        await Charity.findByIdAndDelete(
          req.params.id
        );

      if (!charity) {
        return res.status(404).json({
          message: "Charity not found",
        });
      }

      res.json({
        message:
          "Charity deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete charity error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete charity",
      });
    }
  }
);

export default router;

