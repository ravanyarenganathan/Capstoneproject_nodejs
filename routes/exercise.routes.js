const express = require('express');
const { addExercise, getUserLogs } = require('../handlers/exercise.handler');

const router = express.Router();

router.post('/:_id/exercises', addExercise);
router.get('/:_id/logs', getUserLogs);

module.exports = router;
