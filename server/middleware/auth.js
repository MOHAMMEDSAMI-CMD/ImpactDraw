import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==========================================
// REQUIRE AUTH
// Supports:
// 1. Authorization: Bearer TOKEN
// 2. Cookie: token
// ==========================================

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // ==========================================
    // 1. CHECK AUTHORIZATION HEADER
    // ==========================================

    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (
      authHeader &&
      authHeader.startsWith("Bearer ")
    ) {
      token = authHeader.substring(7).trim();

      console.log(
        "TOKEN SOURCE: Authorization Header"
      );
    }

    // ==========================================
    // 2. IF HEADER NOT FOUND, CHECK COOKIE
    // ==========================================

    if (!token && req.cookies?.token) {
      token = req.cookies.token;

      console.log(
        "TOKEN SOURCE: Cookie"
      );
    }

    // ==========================================
    // 3. TOKEN CHECK
    // ==========================================

    if (!token) {
      console.log("NO AUTH TOKEN FOUND");

      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    console.log(
      "TOKEN LENGTH:",
      token.length
    );

    // ==========================================
    // 4. VERIFY JWT
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log(
      "DECODED TOKEN:",
      decoded
    );

    // ==========================================
    // 5. GET USER
    // ==========================================

    const user = await User.findById(
      decoded.id
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // 6. ACTIVE ACCOUNT CHECK
    // ==========================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // ==========================================
    // 7. ATTACH USER
    // ==========================================

    req.user = user;

    console.log(
      "AUTHENTICATED USER:",
      user.email
    );

    next();

  } catch (error) {
    console.error(
      "Auth middleware error:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ==========================================
// REQUIRE ADMIN
// ==========================================

export const requireAdmin = (
  req,
  res,
  next
) => {

  console.log(
    "ADMIN CHECK:",
    req.user?.email
  );

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!req.user.isAdmin) {
    console.log(
      "IS ADMIN:",
      req.user.isAdmin
    );

    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};