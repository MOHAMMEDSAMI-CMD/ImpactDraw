import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// JWT TOKEN
// ==========================================

function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      isAdmin: user.isAdmin === true,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

// ==========================================
// SIGNUP
// POST /api/auth/signup
// ==========================================

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      charity,
      charityPercentage,
    } = req.body;

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // ----------------------------------------
    // CHECK EXISTING USER
    // ----------------------------------------

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // ----------------------------------------
    // HASH PASSWORD
    // ----------------------------------------

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // ----------------------------------------
    // CREATE USER
    // ----------------------------------------

    const user = await User.create({
      name: name.trim(),

      email: normalizedEmail,

      password: hashedPassword,

      charity: charity || null,

      charityPercentage:
        Number(charityPercentage) >= 10
          ? Number(charityPercentage)
          : 10,

      // NEVER allow signup to create admin
      isAdmin: false,

      isActive: true,
    });

    // ----------------------------------------
    // JWT
    // ----------------------------------------

    const token = signToken(user);

    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(201).json({
      success: true,

      message: "Account created successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,

        isActive: user.isActive,

        subscriptionStatus:
          user.subscriptionStatus,

        subscriptionPlan:
          user.subscriptionPlan,

        subscriptionRenewalDate:
          user.subscriptionRenewalDate,

        charity: user.charity,

        charityPercentage:
          user.charityPercentage,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
});

// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // ----------------------------------------
    // FIND USER
    // ----------------------------------------

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).populate(
        "charity",
        "name image description website"
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ----------------------------------------
    // PASSWORD
    // ----------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ----------------------------------------
    // ACTIVE CHECK
    // ----------------------------------------

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // ----------------------------------------
    // JWT
    // ----------------------------------------

    const token = signToken(user);

    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.json({
      success: true,

      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,

        isAdmin: user.isAdmin === true,

        isActive: user.isActive,

        subscriptionStatus:
          user.subscriptionStatus,

        subscriptionPlan:
          user.subscriptionPlan,

        subscriptionRenewalDate:
          user.subscriptionRenewalDate,

        charity: user.charity,

        charityPercentage:
          user.charityPercentage,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// ==========================================
// GET CURRENT USER
// GET /api/auth/me
// ==========================================

router.get(
  "/me",
  requireAuth,
  async (req, res) => {
    try {
      // requireAuth has already verified
      // the JWT and loaded the user.

      const user =
        await User.findById(
          req.user._id
        )
          .select("-password")
          .populate(
            "charity",
            "name description image website"
          );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,

          isAdmin:
            user.isAdmin === true,

          isActive:
            user.isActive === true,

          subscriptionStatus:
            user.subscriptionStatus,

          subscriptionPlan:
            user.subscriptionPlan,

          subscriptionRenewalDate:
            user.subscriptionRenewalDate,

          charity: user.charity,

          charityPercentage:
            user.charityPercentage,

          createdAt:
            user.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get current user",
      });
    }
  }
);

// ==========================================
// LOGOUT
// POST /api/auth/logout
// ==========================================

router.post(
  "/logout",
  (req, res) => {
    return res.json({
      success: true,
      message:
        "Logged out successfully",
    });
  }
);

export default router;