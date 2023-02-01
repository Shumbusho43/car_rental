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
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    cloudinaryPublicId: {
        type: String,
    },
    sits: {
        type: Number,
        required: true
    },
    hired: {
        type: Boolean,
        default: false
    },
    numberPlate: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
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
        price: Joi.number().required(),
        image: Joi.string().required(),
        sits: Joi.number().required(),
        numberPlate: Joi.string().required(),
        owner: Joi.string().required(),
    });
    return schema.validate(car);
}
module.exports.validateCarModel = validateCar;
module.exports.Car = mongoose.model("Car", carModel);