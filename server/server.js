import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDb from "./config/db.js";

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




const app = express();

// ==========================================
// ENV CHECK
// ==========================================

console.log(
  "STRIPE_SECRET_KEY:",
  process.env.STRIPE_SECRET_KEY
    ? "LOADED"
    : "MISSING"
);

// ==========================================
// DATABASE
// ==========================================

connectDb();

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// ==========================================
// ROOT
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ImpactDraw API Running",
  });
});

// ==========================================
// ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRouter
);

app.use(
  "/api/user",
  userRouter
);

app.use(
  "/api/charities",
  charityRouter
);

app.use(
  "/api/draws",
  drawRouter
);

app.use(
  "/api/admin",
  adminRouter
);

app.use(
  "/api/withdrawals",
  withdrawalRouter
);

app.use(
  "/api/admin/users",
  adminUsersRouter
);

app.use("/api/wallet", walletRouter);

app.use(
  "/api/admin/draws",
  adminDrawRouter
);

app.use("/api/admin/winners", winnerRouter);

app.use(
  "/api/subscriptions",
  subscriptionRouter
);



app.use(
  "/api/scores",
  scoreRouter
);

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);
app.use("/api/draws", drawRouter);

// ==========================================
// ERROR HANDLER
// ==========================================

app.use(
  (err, req, res, next) => {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
);

// ==========================================
// SERVER
// ==========================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});