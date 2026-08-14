import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDb from "./config/db.js";

// ===============================
// ROUTES IMPORT
// ===============================

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";

import charityRouter from "./routes/charities.js";

import drawRouter from "./routes/draws.js";

import adminRouter from "./routes/admin.js";
import adminUsersRouter from "./routes/adminUsers.js";

import subscriptionRouter from "./routes/subscriptions.js";

import scoreRouter from "./routes/scores.js";

import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";

import adminDrawRouter from "./routes/adminDraws.js";

import winnerRouter from "./routes/winners.js";

import walletRouter from "./routes/wallet.js";

import withdrawalRouter from "./routes/withdrawal.js";

import adminWithdrawalsRouter from "./routes/adminWithdrawals.js";

import profileRoutes from "./routes/profileRoutes.js";

// ⭐ STRIPE WEBHOOK
import stripeWebhookRouter from "./routes/stripeWebhook.js";


// ===============================
// APP
// ===============================

const app = express();


// ===============================
// DATABASE
// ===============================

connectDb();


// ===============================
// CORS
// ===============================

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {

      // Allow requests without Origin
      // Example: Postman / Stripe / server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`Not allowed by CORS: ${origin}`)
      );
    },

    credentials: true,
  })
);


// =====================================================
// ⭐ STRIPE WEBHOOK
// =====================================================
//
// IMPORTANT:
//
// This MUST come BEFORE express.json()
//
// Stripe webhook requires the RAW request body.
// stripeWebhook.js itself uses:
//
// express.raw({ type: "application/json" })
//
// =====================================================

app.use(
  "/api/stripe",
  stripeWebhookRouter
);


// ===============================
// GENERAL MIDDLEWARE
// ===============================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());


// ===============================
// PROFILE ROUTES
// ===============================

app.use(
  "/api/profile",
  profileRoutes
);


// ===============================
// ROOT
// ===============================

app.get("/", (req, res) => {

  return res.status(200).json({
    success: true,
    message: "ImpactDraw API Running",
  });

});


// ===============================
// AUTH ROUTES
// ===============================

app.use(
  "/api/auth",
  authRouter
);


// ===============================
// USER ROUTES
// ===============================

app.use(
  "/api/user",
  userRouter
);


// ===============================
// CHARITY ROUTES
// ===============================

app.use(
  "/api/charities",
  charityRouter
);


// ===============================
// USER DRAW ROUTES
// ===============================
//
// GET  /api/draws/active
// GET  /api/draws/latest
// GET  /api/draws/history
// POST /api/draws/enter
//
// ===============================

app.use(
  "/api/draws",
  drawRouter
);


// ===============================
// SUBSCRIPTION ROUTES
// ===============================
//
// POST /api/subscriptions/create-checkout-session
// GET  /api/subscriptions/verify
// GET  /api/subscriptions/history
//
// ===============================

app.use(
  "/api/subscriptions",
  subscriptionRouter
);


// ===============================
// SCORE ROUTES
// ===============================

app.use(
  "/api/scores",
  scoreRouter
);


// ===============================
// WALLET ROUTES
// ===============================

app.use(
  "/api/wallet",
  walletRouter
);


// ===============================
// WITHDRAWAL ROUTES
// ===============================

app.use(
  "/api/withdrawals",
  withdrawalRouter
);


// ===============================
// ADMIN ROUTES
// ===============================

app.use(
  "/api/admin",
  adminRouter
);


// ===============================
// ADMIN USERS
// ===============================

app.use(
  "/api/admin/users",
  adminUsersRouter
);


// ===============================
// ADMIN DRAW ROUTES
// ===============================
//
// POST /api/admin/draws/simulate
// POST /api/admin/draws/publish
// POST /api/admin/draws/:drawId/calculate-winners
//
// ===============================

app.use(
  "/api/admin/draws",
  adminDrawRouter
);


// ===============================
// ADMIN WINNERS
// ===============================

app.use(
  "/api/admin/winners",
  winnerRouter
);


// ===============================
// ADMIN DASHBOARD
// ===============================

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);


// ===============================
// ADMIN WITHDRAWALS
// ===============================

app.use(
  "/api/admin/withdrawals",
  adminWithdrawalsRouter
);


// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {

  return res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });

});


// ===============================
// ERROR HANDLER
// ===============================

app.use(
  (err, req, res, next) => {

    console.error(
      "SERVER ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message || "Server Error",
    });

  }
);


// ===============================
// SERVER
// ===============================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {

    console.log(
      `🚀 ImpactDraw server running on port ${PORT}`
    );

  }
);