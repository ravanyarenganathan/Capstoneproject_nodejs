const express = require("express");
const { addUser, getUsersDetail } = require("../controllers/userController");
const router = express.Router();

router.route("/").get(getUsersDetail).post(addUser);

module.exports = router;
