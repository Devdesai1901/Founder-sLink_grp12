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

  //check number
  checkNumber(test, varName) {
    //if (!test) throw `Error: You must provide a ${varName}`;
    if (typeof test != "number") throw `Error:${varName} must be a number`;
    if (!isFinite(test)) throw `Error:${varName} must be a  finite number`;
    if (!Number.isInteger(test) || test < 0)
      throw `Error:${varName} must be a whole number and gretaer than 0`;
    return test;
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
