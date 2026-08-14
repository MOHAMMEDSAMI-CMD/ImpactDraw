import express from "express";
import User from "../models/User.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";


const router = express.Router();


// ==========================================
// GET ALL USERS
// GET /api/admin/users
// ==========================================

router.get(
  "/users",
  requireAuth,
  requireAdmin,
  async (req,res)=>{

    try{

      const users =
      await User.find()
      .select("-password")
      .populate(
        "charity",
        "name"
      )
      .sort({
        createdAt:-1
      });


      return res.json({

        success:true,

        users

      });


    }
    catch(error){

      console.error(
        "Get users error:",
        error
      );


      return res.status(500)
      .json({

        success:false,

        message:
        "Failed to load users"

      });

    }

  }
);




// ==========================================
// ACTIVATE / DEACTIVATE USER
// PATCH /api/admin/users/:id/status
// ==========================================

router.patch(
  "/users/:id/status",
  requireAuth,
  requireAdmin,
  async(req,res)=>{


    try{


      const {
        isActive
      } = req.body;



      if(
        typeof isActive !== "boolean"
      ){

        return res.status(400)
        .json({

          success:false,

          message:
          "isActive must be boolean"

        });

      }



      const user =
      await User.findById(
        req.params.id
      );



      if(!user){

        return res.status(404)
        .json({

          success:false,

          message:
          "User not found"

        });

      }



      // admin khud ko deactivate nahi kar sakta

      if(
        String(user._id)
        ===
        String(req.user.id)
      ){

        return res.status(400)
        .json({

          success:false,

          message:
          "Cannot deactivate yourself"

        });

      }



      user.isActive =
      isActive;


      await user.save();



      const updatedUser =
      await User.findById(
        user._id
      )
      .select("-password")
      .populate(
        "charity",
        "name"
      );



      return res.json({

        success:true,

        message:
        isActive
        ?
        "User activated successfully"
        :
        "User deactivated successfully",


        user:updatedUser

      });



    }
    catch(error){


      console.error(
        "Status update error:",
        error
      );


      return res.status(500)
      .json({

        success:false,

        message:
        "Failed to update status"

      });

    }


  }
);





// ==========================================
// MAKE ADMIN / REMOVE ADMIN
// PATCH /api/admin/users/:id/admin
// ==========================================


router.patch(
"/users/:id/admin",
requireAuth,
requireAdmin,
async(req,res)=>{


try{


const {
isAdmin
}=req.body;



if(
typeof isAdmin !== "boolean"
){

return res.status(400)
.json({

success:false,

message:
"isAdmin must be boolean"

});

}



const user =
await User.findById(
req.params.id
);



if(!user){

return res.status(404)
.json({

success:false,

message:
"User not found"

});

}




if(
String(user._id)
===
String(req.user.id)
&&
isAdmin === false
){

return res.status(400)
.json({

success:false,

message:
"Cannot remove your own admin access"

});

}



user.isAdmin =
isAdmin;


await user.save();



const updatedUser =
await User.findById(
user._id
)
.select("-password")
.populate(
"charity",
"name"
);



return res.json({

success:true,

message:
isAdmin
?
"Admin access granted"
:
"Admin access removed",

user:updatedUser

});



}
catch(error){


console.error(
"Admin role error:",
error
);



return res.status(500)
.json({

success:false,

message:
"Failed to update admin role"

});


}


}
);



export default router;