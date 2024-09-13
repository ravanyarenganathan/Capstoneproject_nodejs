const {
  checkValidDateOrNot,
  checkValidDurationOrNot,
  checkValidDescrptionOrNot,
} = require("./validateDate");

const checkValidFormField = (exercise) => {
  const { description, duration, date } = exercise;
  let isValidForm = {};
  isValidForm = {
    ...checkValidDescrptionOrNot(description),
    ...checkValidDurationOrNot(duration),
    ...checkValidDateOrNot(date),
  };
  return isValidForm;
};

module.exports = { checkValidFormField };
