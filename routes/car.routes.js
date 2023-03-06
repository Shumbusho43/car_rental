const express = require('express');
const {
    uploadCar,
    getAllCars,
    getCarById,
    uploadCarImage,
    getBorrowedCars,
    getFreeCars
} = require('../controller/car.controller');
const {
    protect,
    role
} = require('../utils/protect');
const router = express.Router();
router.get("/get-borrowed-cars", protect, role('owner', 'admin'), getBorrowedCars);
router.get("/get-free-cars", getFreeCars);
router.route("/:id")
    .post(uploadCar,protect, role('owner'))
    .get(getCarById)
    .put(uploadCarImage,protect, role('owner'))
router.get("/", getAllCars)
module.exports.carRouter = router;