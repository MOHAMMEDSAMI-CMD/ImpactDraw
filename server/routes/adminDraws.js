import express from "express";
import Draw from "../models/Draw.js";
import User from "../models/User.js";
import Winner from "../models/Winner.js";
import DrawEntry from "../models/DrawEntry.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";


const router = express.Router();


// ==========================================
// HELPERS
// ==========================================

function getCurrentMonthYear(){

  const now = new Date();

  return {

    month: now.toLocaleString(
      "en-US",
      {
        month:"long"
      }
    ),

    year: now.getFullYear()

  };

}



function generateRandomNumbers(){

  const numbers = new Set();


  while(numbers.size < 5){

    numbers.add(
      Math.floor(Math.random()*45)+1
    );

  }


  return [...numbers].sort(
    (a,b)=>a-b
  );

}



// ==========================================
// GET OR CREATE DRAW
// ==========================================


async function getOrCreateCurrentDraw(){


 const {month,year} =
 getCurrentMonthYear();



 let draw =
 await Draw.findOne({
   month,
   year
 });



 if(draw){

   return draw;

 }



 draw =
 await Draw.create({

   month,

   year,

   numbers:[],

   eligibleSubscribers:0,

   prizePool:0,

   jackpot:0,

   status:"pending"

 });



 return draw;


}





// ==========================================
// CURRENT DRAW
// ==========================================


router.get(
"/current",
requireAuth,
requireAdmin,
async(req,res)=>{


 try{


 const draw =
 await getOrCreateCurrentDraw();



 res.json({

 success:true,

 draw

 });


 }catch(error){


 console.log(error);


 res.status(500).json({

 success:false,

 message:"Failed"

 });


 }


});






// ==========================================
// SIMULATE DRAW
// ==========================================


router.post(
"/simulate",
requireAuth,
requireAdmin,
async(req,res)=>{


try{


const draw =
await getOrCreateCurrentDraw();




// GET USER ENTRIES

const entries =
await DrawEntry.find({

 draw:draw._id

});





// UPDATE COUNT

draw.eligibleSubscribers =
entries.length;



draw.prizePool =
entries.length * 100;



draw.jackpot =
draw.prizePool * 0.4;





// RANDOM WINNING NUMBER


const numbers =
generateRandomNumbers();



draw.numbers =
numbers;


draw.status =
"simulated";



await draw.save();




res.json({

success:true,

message:
"Draw simulated successfully",

drawId:draw._id,

numbers,

eligibleSubscribers:
draw.eligibleSubscribers,

prizePool:
draw.prizePool,

jackpot:
draw.jackpot,


draw


});



}catch(error){


console.log(
"SIMULATE ERROR",
error
);



res.status(500).json({

success:false,

message:
"Simulation failed"

});


}



});

// ==========================================
// PUBLISH DRAW + CREATE WINNERS
// POST /api/admin/draws/publish
// ==========================================


router.post(
"/publish",
requireAuth,
requireAdmin,
async(req,res)=>{


try{


const {
drawId,
numbers
}=req.body;



if(!drawId){

return res.status(400).json({

success:false,

message:"Draw ID required"

});

}




const draw =
await Draw.findById(drawId);



if(!draw){

return res.status(404).json({

success:false,

message:"Draw not found"

});

}




if(
!Array.isArray(numbers) ||
numbers.length!==5
){


return res.status(400).json({

success:false,

message:
"Exactly 5 numbers required"

});


}





const winningNumbers =
numbers.map(Number);




if(
new Set(winningNumbers).size !== 5
){


return res.status(400).json({

success:false,

message:
"Numbers must be unique"

});


}




winningNumbers.sort(
(a,b)=>a-b
);




// SAVE DRAW


draw.numbers =
winningNumbers;


draw.status =
"published";


draw.publishedAt =
new Date();



await draw.save();







// =====================================
// FIND USER ENTRIES
// =====================================


const entries =
await DrawEntry.find({

draw:draw._id

});





const createdWinners=[];





// =====================================
// CHECK MATCH
// =====================================


for(const entry of entries){


const userNumbers =
entry.numbers.map(Number);



const matchedNumbers =
winningNumbers.filter(
num =>
userNumbers.includes(num)
);



const matchCount =
matchedNumbers.length;



let matchType=null;

let prize=0;




if(matchCount===5){


matchType="5-number";

prize =
draw.jackpot;


}

else if(matchCount===4){


matchType="4-number";


prize =
draw.prizePool * 0.35;


}


else if(matchCount===3){


matchType="3-number";


prize =
draw.prizePool * 0.25;


}




// NO WINNER

if(!matchType){

continue;

}





// DUPLICATE CHECK


const exist =
await Winner.findOne({

user:entry.user,

draw:draw._id

});



if(exist){

continue;

}






const winner =
await Winner.create({

user:entry.user,

draw:draw._id,

numbers:userNumbers,

matchedNumbers,

matchType,

prize,


verificationStatus:
"pending",


payoutStatus:
"pending",


proofUrl:""


});



createdWinners.push(
winner
);



}






return res.json({

success:true,

message:
"Draw published and winners created",


draw,


winners:
createdWinners,


totalWinners:
createdWinners.length


});




}catch(error){



console.error(
"PUBLISH ERROR",
error
);



return res.status(500).json({

success:false,

message:
"Publish failed"

});


}



});


// ==========================================
// CALCULATE WINNERS
// POST /api/admin/draws/:drawId/calculate-winners
// ==========================================

router.post(
  "/:drawId/calculate-winners",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { drawId } = req.params;

      const draw = await Draw.findById(drawId);

      if (!draw) {
        return res.status(404).json({
          success: false,
          message: "Draw not found",
        });
      }

      if (draw.status !== "published") {
        return res.status(400).json({
          success: false,
          message: "Draw is not published yet",
        });
      }

      if (
        !Array.isArray(draw.numbers) ||
        draw.numbers.length !== 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid winning numbers",
        });
      }

      // =====================================
      // FIND ENTRIES FOR SAME DRAW
      // =====================================

      const entries = await DrawEntry.find({
        draw: draw._id,
      });

      const createdWinners = [];

      // =====================================
      // CHECK EACH USER ENTRY
      // =====================================

      for (const entry of entries) {
        const userNumbers =
          entry.numbers.map(Number);

        const matchedNumbers =
          draw.numbers.filter((number) =>
            userNumbers.includes(number)
          );

        const matchCount =
          matchedNumbers.length;

        let matchType = null;
        let prize = 0;

        // 5 MATCH
        if (matchCount === 5) {
          matchType = "5-number";
          prize = draw.jackpot;
        }

        // 4 MATCH
        else if (matchCount === 4) {
          matchType = "4-number";
          prize =
            draw.prizePool * 0.35;
        }

        // 3 MATCH
        else if (matchCount === 3) {
          matchType = "3-number";
          prize =
            draw.prizePool * 0.25;
        }

        // No winner
        if (!matchType) {
          continue;
        }

        // =====================================
        // DUPLICATE CHECK
        // =====================================

        const existingWinner =
          await Winner.findOne({
            user: entry.user,
            draw: draw._id,
          });

        if (existingWinner) {
          continue;
        }

        // =====================================
        // CREATE WINNER
        // =====================================

        const winner =
          await Winner.create({
            user: entry.user,
            draw: draw._id,
            numbers: userNumbers,
            matchedNumbers,
            matchType,
            prize,

            proofUrl: "",

            verificationStatus:
              "pending",

            payoutStatus:
              "pending",

            verifiedAt: null,

            paidAt: null,
          });

        createdWinners.push(winner);
      }

      return res.json({
        success: true,

        message:
          createdWinners.length > 0
            ? "Winners calculated successfully"
            : "No winners found",

        totalWinners:
          createdWinners.length,

        winners: createdWinners,
      });

    } catch (error) {
      console.error(
        "CALCULATE WINNERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to calculate winners",
      });
    }
  }
);





// ==========================================
// GET ALL DRAWS
// ==========================================


router.get(
"/",
requireAuth,
requireAdmin,
async(req,res)=>{


try{


const draws =
await Draw.find()
.sort({
createdAt:-1
});



res.json({

success:true,

draws

});



}catch(error){


res.status(500).json({

success:false,

message:
"Failed to load draws"

});


}


});

router.post("/open", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { drawId } = req.body;

    if (!drawId) {
      return res.status(400).json({
        success: false,
        message: "Draw ID is required",
      });
    }

    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found",
      });
    }

    if (draw.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Published draw cannot be opened.",
      });
    }

    if (draw.status === "simulated") {
      return res.status(400).json({
        success: false,
        message:
          "Simulated draw cannot be opened. Create/open a new draw.",
      });
    }

    draw.status = "open";

    await draw.save();

    return res.json({
      success: true,
      message: "Draw is now open for entries.",
      draw,
    });
  } catch (error) {
    console.error(
      "Open draw error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to open draw.",
    });
  }
});





export default router;
