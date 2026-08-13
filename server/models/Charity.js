import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    events: {
      type: [eventSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Charity", charitySchema);