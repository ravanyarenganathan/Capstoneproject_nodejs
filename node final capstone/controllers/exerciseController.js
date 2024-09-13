const asyncHandler = require("express-async-handler");
const exercise = require("../models/exerciseModel");
const user = require("../models/userModel");
const { getUserDetail } = require("./userController");
const { isValidDate } = require("../middleware/validateDate");
const { checkValidFormField } = require("../middleware/validateFormField");
const moment = require("moment");
const { STATUS_CODE } = require("../const/httpStatusCode");

// Adding the Exercises
const addExercise = asyncHandler(async (req, res) => {
    const exerciseObj = {
        ...req.body,
        userId: req.params._id,
        date: req.body.date || moment(),
    };
    const isValidForm = checkValidFormField(exerciseObj);
    if (Object.entries(isValidForm).length === 0) {
        try {
            const result = await user.findById(req.params._id);
            if (!result) {
                throw new Error();
            }
            let { userId, description, duration, date } = await exercise.create(
                exerciseObj
            );
            res.json({
                _id: userId,
                username: result.username,
                description,
                duration,
                date,
            });
        } catch (error) {
            throw new Error(`User with ID ${req.params._id} not found `);
        }
    } else {
        res.status(STATUS_CODE.CLIENT_ERROR_RESPONSE_CODE).json(isValidForm);
    }
});

// getting exercises with filters
const getExercises = asyncHandler(async (req, res) => {
    const { _id, username } = await getUserDetail(req.params._id);
    let query = { userId: _id };

    let exercises = [];
    let count = 0;

    if (req.query) {
        const isValidDateformat = isValidDate(req.query);
        const { from, to, limit } = req.query;

        if (!isValidDateformat) {
            if (from && !to) {
                query.date = { $gte: new Date(from) }; // $gte for greater than or equal to
            } else if (!from && to) {
                const endDate = new Date(to);
                endDate.setHours(23, 59, 59, 999);
                query.date = { $lte: endDate }; // $lte for less than or equal to
            } else if (from && to) {
                const endDate = new Date(to);
                endDate.setHours(23, 59, 59, 999);
                query.date = { $gte: new Date(from), $lte: endDate };
            }
        }

        const result = await exercise
            .find(query)
            .sort({ date: 1 })
            .limit(limit || 10);

        exercises = result.map((obj) => {
            const { _id, description, duration, date } = obj;
            return { _id, description, duration, date };
        });
        count = await exercise.countDocuments(query); // Get total count without limit
    }

    const response = {
        _id,
        username,
        count,
        logs: exercises,
    };

    res.json(response);
});

module.exports = {
    addExercise,
    getExercises,
};
