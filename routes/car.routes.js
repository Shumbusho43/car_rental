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
router.use(protect);
router.get("/get-borrowed-cars", protect, role('owner', 'admin'), getBorrowedCars);
router.get("/get-free-cars", protect,getFreeCars);
router.route("/:id")
    .post(uploadCar, role('owner'))
    .get(getCarById)
    .put(uploadCarImage, role('owner'))
router.get("/", getAllCars)
module.exports.carRouter = router;