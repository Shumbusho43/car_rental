const {
    BorrowCar
} = require('../models/car.borrow')
const {
    Car
} = require('../models/car.model')
//borrowing a car
exports.borrowACar = async (req, res) => {
    const userId = req.user._id;
    const {
        carId
    } = req.params
    //check if car exists
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({
        status: false,
        message: "Car not found"
    })
    //check if car is not borrowed
    const borrowed = await BorrowCar.findOne({
        carId,
        status: "In use"
    })
    if (borrowed) return res.status(400).json({
        status: false,
        message: "Car already borrowed"
    })
    //insert data into BorrowCarModel
    const data = new BorrowCar({
        carId,
        userId
    })
    const result = await data.save();
    if (!result) return res.status(400).json({
        status: false,
        message: "Car not borrowed"
    })
    //update car status
    car.status = "In use";
    await car.save();
    res.status(200).json({
        status: true,
        message: "Car borrowed successfully"
    })
}