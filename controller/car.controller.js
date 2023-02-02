//car management apis
const {
    Car,
    validateCarModel
} = require("../models/car.model");
const {
    User
} = require("../models/user.model");
const {
    validateObjectId
} = require("../utils/mongoId");
//check if owner exist
const ownerExist = async (owner) => {
    const exist = await User.findOne({
        _id: owner
    });
    if (!exist) {
        return false;
    }
    return true;
}
//uploading a car
exports.uploadCar = async (req, res) => {
    try {
        const {
            name,
            pricePerHr,
            description,
            model,
            sits,
            numberPlate,
        } = req.body;
        const owner = req.params.id;
        //validating the car
        const {
            error
        } = validateCarModel(req.body);
        if (error) {
            const er = error.details[0].message.split('"').join('');
            return res.status(400).json({
                message: er
            });
        }
        //validating valid mongo id
        const isValid = validateObjectId(owner);
        if (!isValid) {
            return res.status(400).json({
                message: "invalid owner id"
            });
        }
        //check if owner exist
        const exist =await ownerExist(owner);
        if (!exist) {
            return res.status(400).json({
                status: "fail",
                message: "Owner does not exist"
            })
        }
        //checking if the car already exists
        const carExists = await Car.findOne({
            numberPlate
        });
        if (carExists) {
            return res.status(400).json({
                message: "car already exists"
            });
        }
        const car = new Car({
            name,
            pricePerHr,
            description,
            model,
            sits,
            numberPlate,
            owner,
        });
        await car.save();
        res.status(200).json({
            message: "car uploaded successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};
//getting all cars
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find();
        res.status(200).json({
            cars
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};
//getting a car by id
exports.getCarById = async (req, res) => {
    try {
        const id = req.params.id;
        const isValid = validateObjectId(id);
        if (!isValid) {
            return res.status(400).json({
                message: "invalid car id"
            });
        }
        const car = await Car.findById(id);
        if (!car) {
            return res.status(400).json({
                message: "car not found"
            });
        }
        res.status(200).json({
            car
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};
//updating a car
exports.updateCar = async (req, res) => {
    try {
        const id = req.params.id;
        const isValid = validateObjectId(id);
        if (!isValid) {
            return res.status(400).json({
                message: "invalid car id"
            });
        }
        const {
            name,
            pricePerHr,
            description,
            model,
            sits,
            numberPlate,
        } = req.body;
        //validating the car
        const {
            error
        } = validateCarModel(req.body);
        if (error) {
            const er = error.details[0].message.split('"').join('');
            return res.status(400).json({
                message: er
            });
        }
        //checking if the car already exists
        const carExists = await Car.findOne({
            numberPlate
        });
        if (carExists) {
            return res.status(400).json({
                message: "car already exists"
            });
        }
        const car = await Car.findByIdAndUpdate(id, {
            name,
            pricePerHr,
            description,
            model,
            sits,
            numberPlate,
        });
        if (!car) {
            return res.status(400).json({
                message: "car not found"
            });
        }
        res.status(200).json({
            message: "car updated successfully",
            data: car
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};