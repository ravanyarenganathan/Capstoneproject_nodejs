const mongoose = require("mongoose");

const exerciseSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User Id is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
    date: {
      type: Date,
    },
  },
  {
    timeStamps: true,
  }
);

module.exports = mongoose.model("Exercise", exerciseSchema);
