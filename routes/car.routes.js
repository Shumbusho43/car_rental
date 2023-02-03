const express = require('express');
const {
    uploadCar,
    getAllCars,
    getCarById,
    uploadCarImage
} = require('../controller/car.controller');
const router = express.Router();
router.route("/:id")
    .post(uploadCar)
    .get(getCarById)
    .put(uploadCarImage)
router.get("/", getAllCars)
module.exports.carRouter = router;