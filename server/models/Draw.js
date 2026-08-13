import mongoose from "mongoose";


const drawSchema = new mongoose.Schema(
{
  // ==========================
  // DRAW MONTH
  // ==========================
  month: {
    type: String,
    required: true,
  },


  // ==========================
  // DRAW YEAR
  // ==========================
  year: {
    type: Number,
    required: true,
  },


  // ==========================
  // WINNING NUMBERS
  // ==========================
  numbers: {
    type: [Number],
    default: [],
  },


  // ==========================
  // DRAW MODE
  // ==========================
  mode: {
    type: String,
    enum: [
      "random",
      "algorithmic",
    ],
    default: "random",
  },


  // ==========================
  // ACTIVE SUBSCRIBERS
  // ==========================
  eligibleSubscribers: {
    type: Number,
    default: 0,
  },


  // ==========================
  // PRIZE POOL
  // ==========================
  prizePool: {
    type: Number,
    default: 0,
  },


  // ==========================
  // JACKPOT
  // ==========================
  jackpot: {
    type: Number,
    default: 0,
  },


  // ==========================
  // WINNER
  // ==========================
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },


  winnerScore: {
    type: Number,
    default: null,
  },


  // ==========================
  // DRAW STATUS
  // ==========================
  /*
  
  pending   -> Admin created draw
  open      -> Users can enter draw
  simulated -> Numbers generated
  published -> Result announced
  
  */

  status: {
    type: String,
    enum: [
      "pending",
      "open",
      "simulated",
      "published",
    ],
    default: "pending",
  },


  // ==========================
  // PUBLISHED DATE
  // ==========================
  publishedAt: {
    type: Date,
    default: null,
  },


},
{
  timestamps:true,
}
);



export default mongoose.model(
  "Draw",
  drawSchema
);