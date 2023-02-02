//validating valid mongo id
const mongoose = require("mongoose");
const Joi = require("joi");
const validateObjectId = (id) => {
    if(!mongoose.Types.ObjectId.isValid(id)) return false;
    return true;
}
module.exports.validateObjectId = validateObjectId;