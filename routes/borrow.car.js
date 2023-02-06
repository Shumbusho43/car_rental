const express = require('express');
const {
    borrowACar
} = require('../controller/borrow.car.controller');
const {
    protect
} = require('../utils/protect');
const router = express.Router();
router.route("/:carId")
    .post(protect, borrowACar)
module.exports.borrowCarRouter = router;