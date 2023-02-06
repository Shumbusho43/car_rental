const mongoose = require("mongoose");
const Joi = require("joi");
const carModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    pricePerHr: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    cloudinaryPublicId: {
        type: String,
    },
    sits: {
        type: Number,
        required: true
    },
    numberPlate: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["free", "unavailable"],
        default: "free"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const validateCar = (car) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        model: Joi.string().required(),
        pricePerHr: Joi.number().required(),
        image: Joi.string(),
        sits: Joi.number().required().max(60),
        numberPlate: Joi.string().required().max(10),
        owner: Joi.string(),
        description: Joi.string().required().max(100)
    });
    return schema.validate(car);
}
module.exports.validateCarModel = validateCar;
module.exports.Car = mongoose.model("Car", carModel);