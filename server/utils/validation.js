// file to reuse the validation functions
import { ObjectId } from "mongodb";
const exportedMethod = {
  //check string
  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    // if (!isNaN(strVal))
    //   throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },

  //check bool
  checkBool(boolVal, varName) {
    if (typeof boolVal !== "boolean") throw `Error: ${varName} must be a bool!`;
    if (typeof boolVal === "undefined") throw "Value cant be undefined";
    // if (!isNaN(boolVal))
    //   throw `Error: ${boolVal} is not a valid value for ${varName} as it only contains digits`;
    return boolVal;
  },

  //check input length
  checkLenCharacters(input, fieldName, min, max) {
    if (input.length < min || input.length > max) {
      throw new Error(
        `${fieldName} must be between ${min} and ${max} characters long`
      );
    }
    return input;
  },

  //check number
  checkNumber(test, varName) {
    //if (!test) throw `Error: You must provide a ${varName}`;
    if (typeof test != "number") throw `Error:${varName} must be a number`;
    if (!isFinite(test)) throw `Error:${varName} must be a  finite number`;
    if (!Number.isInteger(test) || test < 0)
      throw `Error:${varName} must be a whole number and gretaer than 0`;
    return test;
  },

  checkAmount(amount) {
    // Convert the string to a number
    const number = Number(amount);

    // Check if the conversion is successful
    if (isNaN(number)) {
      throw new Error("Invalid amount. Please enter a valid number.");
    }

    // Ensure the number is greater than or equal to 10,000
    if (number < 10000) {
      throw new Error("Amount must be greater than or equal to 10,000.");
    }

    // Round up the number to the nearest whole value
    const roundedNumber = Math.ceil(number);

    return roundedNumber;
  },
  checkFundingStage(fundingStage) {
    fundingStage = this.checkString(fundingStage, "fundingStage");
    const allowedStages = ["Seed", "Series A", "Series B", "IPO"];
    if (!allowedStages.includes(fundingStage)) {
      throw new Error(
        "Invalid funding stage. Allowed values are: Seed, Series A, Series B, IPO."
      );
    }
    return fundingStage;
  },
  //check id
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== "string") throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },
};

export default exportedMethod;
