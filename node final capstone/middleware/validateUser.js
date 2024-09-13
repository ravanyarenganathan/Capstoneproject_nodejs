const userModel = require("../models/userModel");

const validateUserName = async (username) => {
    const res = username ? "" : { message: "Username is Required " };
    if (!res) {
        return checkUserExistOrNot(username);
    }
    return res;
};

const validateUserId = async (username, userId) => {
    const res = !!username ? "" : { message: `UserId: ${userId} not found ` };
    if (!res) {
        return checkUserExistOrNot(username);
    }
    return res;
};

const checkUserExistOrNot = async (username) => {
    const [isUserExist] = await userModel.find({ username });
    return isUserExist ? { message: "Username is already Exist" } : "";
};

module.exports = { validateUserName, checkUserExistOrNot };
