const { STATUS_CODE } = require("../const/httpStatusCode");

const errorHandler = (err, req, res, next) => {
  res
    .status(STATUS_CODE.CLIENT_ERROR_RESPONSE_CODE)
    .json({ message: err.message });
};

module.exports = { errorHandler };
