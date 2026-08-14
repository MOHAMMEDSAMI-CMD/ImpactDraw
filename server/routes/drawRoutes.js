import express from "express";

import Draw from "../models/Draw.js";
import Winner from "../models/Winner.js";
import DrawEntry from "../models/DrawEntry.js";

import {
  requireAuth,
} from "../middleware/auth.js";


const router = express.Router();


// ==========================================
// HELPERS
// ==========================================

function getCurrentMonthYear() {

  const now = new Date();

  return {
    month: now.toLocaleString(
      "en-US",
      {
        month: "long",
      }
    ),

    year: now.getFullYear(),
  };
}


// ==========================================
// USER - GET ACTIVE DRAW
// GET /api/draws/active
// ==========================================

router.get(
  "/active",
  requireAuth,
  async(req,res)=>{

    try{

      const {
        month,
        year
      } = getCurrentMonthYear();


      const draw =
        await Draw.findOne({

          month,

          year,

          status:{
            $in:[
              "open",
              "simulated"
            ]
          }

        })
        .sort({
          createdAt:-1
        });



      if(!draw){

        return res.json({

          success:true,

          draw:null,

          message:
          "No active draw available"

        });

      }



      return res.json({

        success:true,

        draw

      });



    }
    catch(error){

      console.log(
        "ACTIVE DRAW ERROR",
        error
      );


      return res.status(500)
      .json({

        success:false,

        message:
        "Failed to load active draw"

      });

    }

  }
);



// ==========================================
// USER - CHECK ENTRY
// GET /api/draws/my-entry
// ==========================================

router.get(
  "/my-entry",
  requireAuth,
  async(req,res)=>{

    try{


      const userId =
      req.user?._id ||
      req.user?.id;



      if(!userId){

        return res.status(401)
        .json({

          success:false,

          message:
          "User not found"

        });

      }



      const {
        month,
        year
      } =
      getCurrentMonthYear();



      const draw =
      await Draw.findOne({

        month,

        year

      });



      if(!draw){

        return res.json({

          success:true,

          entered:false,

          entry:null

        });

      }



      const entry =
      await DrawEntry.findOne({

        user:userId,

        draw:draw._id

      });



      return res.json({

        success:true,

        entered:
        !!entry,

        entry

      });



    }
    catch(error){

      console.log(
        "ENTRY CHECK ERROR",
        error
      );


      return res.status(500)
      .json({

        success:false,

        message:
        "Failed to check entry"

      });

    }

  }
);



// ==========================================
// LATEST PUBLISHED DRAW
// GET /api/draws/latest
// ==========================================


router.get(
"/latest",
async(req,res)=>{


try{


const draw =
await Draw.findOne({

status:"published"

})
.sort({

publishedAt:-1

});



if(!draw){

return res.json({

success:true,

draw:null,

winners:[]

});

}



const winners =
await Winner.find({

draw:draw._id

})
.populate(
"user",
"name email"
);



return res.json({

success:true,

draw,

winners

});



}
catch(error){


console.log(
"LATEST ERROR",
error
);


return res.status(500)
.json({

success:false,

message:
"Failed latest draw"

});


}


});




// ==========================================
// DRAW HISTORY
// GET /api/draws/history
// ==========================================


router.get(
"/history",
async(req,res)=>{


try{


const draws =
await Draw.find({

status:"published"

})
.sort({

publishedAt:-1

})
.lean();



const result =
await Promise.all(

draws.map(async(draw)=>{


const winners =
await Winner.find({

draw:draw._id

})
.populate(
"user",
"name email"
)
.lean();



return{

...draw,

winners

};


})

);



return res.json({

success:true,

draws:result

});



}
catch(error){


console.log(
"HISTORY ERROR",
error
);



return res.status(500)
.json({

success:false,

message:
"Failed history"

});


}


});



export default router;