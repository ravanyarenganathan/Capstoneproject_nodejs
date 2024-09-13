const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  token = req.headers.authorization || req.headers.Authorization;
  if (token) {
    res.status(404);
    throw new Error("Unauthorized User");
  }
  const isValidToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
});
