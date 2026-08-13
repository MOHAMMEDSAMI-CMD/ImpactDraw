import mongoose from "mongoose";


const drawEntrySchema = new mongoose.Schema({

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},


draw:{
type:mongoose.Schema.Types.ObjectId,
ref:"Draw",
required:true
},


numbers:[Number]


},{
timestamps:true
});


export default mongoose.model(
"DrawEntry",
drawEntrySchema
);