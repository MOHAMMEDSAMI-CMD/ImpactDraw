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

// ===============================
// STRIPE WEBHOOK
// ===============================

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
  "https://impact-draw-client.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin
      // Example: Postman / server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked:", origin);

      return callback(
        new Error(`Not allowed by CORS: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// STRIPE WEBHOOK
// =====================================================
//
// IMPORTANT:
// Stripe webhook MUST come before express.json()
// because Stripe requires the RAW request body.
//
// Endpoint:
// POST /api/stripe/webhook
//
// =====================================================

app.use(
  "/api/stripe",
  stripeWebhookRouter
);

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// ===============================
// PROFILE
// ===============================

app.use(
  "/api/profile",
  profileRoutes
);

// ===============================
// ROOT
// ===============================

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "ImpactDraw API Running",
  });
});

// ===============================
// AUTH
// ===============================

app.use(
  "/api/auth",
  authRouter
);

// ===============================
// USER
// ===============================

app.use(
  "/api/user",
  userRouter
);

// ===============================
// CHARITIES
// ===============================

app.use(
  "/api/charities",
  charityRouter
);

// ===============================
// USER DRAW ROUTES
// ===============================
//
// /api/draws/active
// /api/draws/latest
// /api/draws/history
// /api/draws/enter
//
// ===============================

app.use(
  "/api/draws",
  drawRouter
);

// ===============================
// SUBSCRIPTIONS
// ===============================

app.use(
  "/api/subscriptions",
  subscriptionRouter
);

// ===============================
// SCORES
// ===============================

app.use(
  "/api/scores",
  scoreRouter
);

// ===============================
// WALLET
// ===============================

app.use(
  "/api/wallet",
  walletRouter
);

// ===============================
// WITHDRAWALS
// ===============================

app.use(
  "/api/withdrawals",
  withdrawalRouter
);

// ===============================
// ADMIN
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
// ADMIN DRAWS
// ===============================
//
// /api/admin/draws/simulate
// /api/admin/draws/publish
// /api/admin/draws/:drawId/calculate-winners
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
// ERROR HANDLER
// ===============================

app.use(
  (err, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      err
    );

    // CORS errors
    if (
      err.message &&
      err.message.includes("Not allowed by CORS")
    ) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
);

// ===============================
// SERVER
// ===============================
//
// Local development ke liye listen.
// Vercel serverless me server/api/index.js
// app ko export karta hai.
//
// ===============================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);

export default app;