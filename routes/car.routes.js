const express = require('express');
const {
    uploadCar,
    getAllCars,
    getCarById,
    uploadCarImage
} = require('../controller/car.controller');
const {
    protect,
    role
} = require('../utils/protect');
const router = express.Router();
router.use(protect);
router.route("/:id")
    .post(uploadCar, role('owner'))
    .get(getCarById)
    .put(uploadCarImage, role('owner'))
router.get("/", getAllCars)
module.exports.carRouter = router;