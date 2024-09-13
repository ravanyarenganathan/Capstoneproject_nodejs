const express = require("express");
const {
  addExercise,
  getExercises,
} = require("../controllers/exerciseController");
const router = express.Router();

router.post("/:_id/exercises", addExercise);
router.get("/:_id/logs", getExercises);

module.exports = router;
