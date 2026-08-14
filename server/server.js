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


app.use(
  cors({
    origin:"http://localhost:5173",
    credentials:true
  })
);



// ===============================
// MIDDLEWARE
// ===============================


app.use(
  express.json()
);


app.use(
  express.urlencoded({
    extended:true
  })
);


app.use(
  cookieParser()
);

app.use("/api/profile", profileRoutes);



// ===============================
// ROOT
// ===============================


app.get("/",(req,res)=>{

 return res.json({

  success:true,

  message:"ImpactDraw API Running"

 });

});



// ===============================
// USER ROUTES
// ===============================


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




// ===============================
// USER DRAW ROUTES
// ===============================

// /api/draws/active
// /api/draws/latest
// /api/draws/history
// /api/draws/enter

app.use(
 "/api/draws",
 drawRouter
);




// ===============================
// SUBSCRIPTION
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
// WITHDRAWAL
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



app.use(
 "/api/admin/users",
 adminUsersRouter
);




// IMPORTANT
// ONLY ONE DRAW ADMIN ROUTE
//
// contains:
// /simulate
// /publish
// /:drawId/calculate-winners
//

app.use(
 "/api/admin/draws",
 adminDrawRouter
);





app.use(
 "/api/admin/winners",
 winnerRouter
);



app.use(
 "/api/admin/dashboard",
 adminDashboardRoutes
);



app.use(
 "/api/admin/withdrawals",
 adminWithdrawalsRouter
);




// ===============================
// ERROR HANDLER
// ===============================


app.use(
(err,req,res,next)=>{

 console.error(
  "SERVER ERROR:",
  err
 );


 res.status(500).json({

  success:false,

  message:"Server Error"

 });


});




// ===============================
// SERVER
// ===============================


const PORT =
process.env.PORT || 5000;



app.listen(
PORT,
()=>{

 console.log(
 `Server running on port ${PORT}`
 );

}
);