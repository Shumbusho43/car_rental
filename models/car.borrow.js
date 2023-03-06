const moongose = require("mongoose");
const Joi = require("joi");
const borrowCarModel = moongose.Schema({
    carId: {
        type: moongose.Schema.Types.ObjectId,
        ref: "Car",
        required: true
    },
    userId: {
        type: moongose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    borrowDate: {
        type: Date,
        default: Date.now
    },
    returnDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["In use", "Returned"],
        default: "In use"
    }
});
module.exports.BorrowCar = moongose.model("BorrowingCar", borrowCarModel);