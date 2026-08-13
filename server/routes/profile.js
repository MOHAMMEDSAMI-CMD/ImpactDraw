import express from "express";
import { requireAuth } from "../middleware/auth.js";

import User from "../models/User.js";
import Winner from "../models/Winner.js";
import DrawEntry from "../models/DrawEntry.js";


const router = express.Router();



// ==========================================
// GET USER DASHBOARD
// GET /api/profile/dashboard
// ==========================================


router.get(
"/dashboard",
requireAuth,
async(req,res)=>{


try{


const user =
await User.findById(
req.user._id
)
.select("-password")
.populate(
"charity",
"name description image website"
);




if(!user){


return res.status(404).json({

success:false,

message:"User not found"

});


}




// Total Draw Entries

const drawsEntered =
await DrawEntry.countDocuments({

user:req.user._id

});





// Winner History

const winners =
await Winner.find({

user:req.user._id

})
.populate(

"draw",

"month year numbers status publishedAt prizePool jackpot"

)
.sort({

createdAt:-1

});





// Total Prize Money

const totalPrizeMoney =
winners.reduce(

(total,item)=>{

return total + (item.prize || 0);

},

0

);





return res.json({


success:true,


dashboard:{



// USER DETAILS

user:{


id:user._id,


name:user.name,


email:user.email,


isAdmin:user.isAdmin || false,


createdAt:user.createdAt


},





// SUBSCRIPTION

subscription:{


status:

user.subscriptionStatus || "inactive",


plan:

user.subscriptionPlan || null,


renewalDate:

user.subscriptionRenewalDate || null


},






// CHARITY

charity:{


selected:

user.charity || null,


percentage:

user.charityPercentage || 0


},





// STATISTICS

statistics:{


drawsEntered,


totalWins:winners.length,


totalPrizeMoney


},





// WINNER LIST

winners



}


});



}
catch(error){


console.log(

"Dashboard error:",

error

);



return res.status(500).json({


success:false,


message:"Failed to load dashboard"


});


}


});








// ==========================================
// UPDATE PROFILE
// PATCH /api/profile
// ==========================================


router.patch(
"/",
requireAuth,
async(req,res)=>{


try{


const {

charity,

charityPercentage

}=req.body;





const updateData={};





if(charity !== undefined){


updateData.charity = charity || null;


}





if(charityPercentage !== undefined){


const percentage =
Number(charityPercentage);




if(
percentage < 10 ||
percentage > 100
){


return res.status(400).json({

success:false,

message:
"Charity percentage must be between 10 and 100"

});


}




updateData.charityPercentage =
percentage;


}





const user =

await User.findByIdAndUpdate(


req.user._id,


updateData,


{

new:true,

runValidators:true

}


)

.select("-password")

.populate(

"charity",

"name description image website"

);






if(!user){


return res.status(404).json({

success:false,

message:"User not found"

});


}





return res.json({


success:true,


message:
"Profile updated successfully",


user



});



}
catch(error){


console.log(

"Profile update error:",

error

);



return res.status(500).json({


success:false,


message:"Failed to update profile"


});


}


});





export default router;