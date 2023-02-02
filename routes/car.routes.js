const express = require('express');
const {
    uploadCar,
    getAllCars,
    getCarById
} = require('../controller/car.controller');
const router = express.Router();
router.route("/:id")
    .post(uploadCar)
    .get(getCarById);
router.get("/", getAllCars)
module.exports.carRouter = router;