import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import Winner from "../models/Winner.js";

const router = express.Router();


// GET CURRENT USER
// GET /api/user/me

router.get(
  "/me",
  requireAuth,
  async (req,res)=>{

    try{

      const user = await User.findById(
        req.user.id
      ).select("-password");


      if(!user){
        return res.status(404).json({
          success:false,
          message:"User not found"
        });
      }


      res.json({
        success:true,
        user
      });


    }catch(error){

      console.log(
        "Get user error:",
        error
      );


      res.status(500).json({
        success:false,
        message:"Failed to get user"
      });

    }

  }
);


// GET /api/user/winners
router.get(
  "/winners",
  requireAuth,
  async (req, res) => {
    try {
      const winners = await Winner.find({
        user: req.user._id,
      })
        .populate(
          "draw",
          "month year numbers prizePool jackpot status publishedAt"
        )
        .sort({
          createdAt: -1,
        });

      return res.json({
        success: true,
        winners,
      });
    } catch (error) {
      console.error(
        "Get user winners error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to load winners",
      });
    }
  }
);

export default router;