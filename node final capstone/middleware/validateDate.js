const moment = require("moment");

function isValidDate(query) {
  const { from, to, limit } = query;
  if (from && !moment(from, "YYYY-MM-DD", true).isValid()) {
    throw new Error("Invalid start date format.");
  }
  if (to && !moment(to, "YYYY-MM-DD", true).isValid()) {
    throw new Error("Invalid end date format.");
  }
  const limitVal = limit ? parseInt(limit, 10) : null;
  if (limitVal !== null && isNaN(limitVal)) {
    throw new Error("Invalid limit parameter: must be a number");
  }
  return "";
}

function checkValidDateOrNot(date) {
  console.log(date, isValidDateFormat(date));
  if (date && !isValidDateFormat(date))
    return { Date: "Invalid Date Please Enter a valid Date" };

  return "";
}

function isValidDateFormat(dateString) {
  const formats = ["YYYY-MM-DD", "YYYY/MM/DD"];
  for (const format of formats) {
    const parsedDate = moment(dateString, format, true);
    if (parsedDate.isValid()) {
      return true;
    }
  }
  return false;
}

function checkValidDescrptionOrNot(description) {
  if (!description) return { Description: "Description Required" };
  return "";
}

function checkValidDurationOrNot(duration) {
  const pattern = /[a-z A-Z]/;
  if (!duration) return { Duration: "Duration Required" };
  else if (
    (typeof duration === "string" && pattern.test(duration)) ||
    duration < 0
  )
    return { Duration: "Duration must be a positive number" };
  else return "";
}

module.exports = {
  isValidDate,
  checkValidDateOrNot,
  checkValidDurationOrNot,
  checkValidDescrptionOrNot,
};
