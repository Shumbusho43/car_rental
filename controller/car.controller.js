//car management apis
const path = require("path");
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
const {
    cloudinary
} = require('../utils/cloudinary');

const {
    BorrowCar
} = require('../models/car.borrow')
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
        const exist = await ownerExist(owner);
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

//uploading car image
exports.uploadCarImage = async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        //validate id
        const valid = validateObjectId(id);
        if (!valid) {
            return res.status(400).json({
                message: "invalid car id"
            });
        }
        //check if car exists
        const car = await Car.findById(id);
        if (!car) {
            return res.status(400).json({
                message: "car not found"
            });
        }
        //check if file is uploaded
        if (!req.files) {
            return res.status(400).json({
                message: "file not uploaded"
            });
        }
        //check if file is an image
        const file = req.files.photo;
        if (!file.mimetype.startsWith("image")) {
            return res.status(400).json({
                message: "file is not an image"
            });
        }
        //check if file size is less than 10mb
        if (file.size > 10000000) {
            return res.status(400).json({
                message: "file size is too large"
            });
        }
        //checking photo name
        file.name = `photo_${car._id}${path.parse(file.name).ext}`;
        //checking if project has cloudinary public id
        if (car.cloudinaryPublicId == null) {
            //uploading to cloudinary
            const result = await cloudinary.uploader.upload(file.tempFilePath).then(result => {
                const body = {
                    image: result.secure_url,
                    cloudinaryPublicId: result.public_id
                }
                Car.findByIdAndUpdate(id, {
                    image: body.image,
                    cloudinaryPublicId: body.cloudinaryPublicId
                }, {
                    new: true
                }, (err, project) => {
                    if (err) {
                        return res.status(500).json({
                            message: "something went wrong"
                        });
                    }
                    if (!project) {
                        return res.status(400).json({
                            message: "project not found"
                        });
                    }
                    res.status(200).json({
                        message: "project image uploaded successfully",
                        data: project
                    })
                })
            }).catch(error => {
                console.log(error);
                return res.status(500).json({
                    message: "something went wrong"
                });
            });
        }
        //deleting old image from cloudinary
        else {
            await cloudinary.uploader.destroy(car.cloudinaryPublicId);
            //uploading new image to cloudinary
            const result = await cloudinary.uploader.upload(file.tempFilePath).then(result => {
                const body = {
                    image: result.secure_url,
                    cloudinaryPublicId: result.public_id
                }
                Car.findByIdAndUpdate(id, {
                    image: body.image,
                    cloudinaryPublicId: body.cloudinaryPublicId
                }, {
                    new: true
                }, (err, project) => {
                    if (err) {
                        return res.status(500).json({
                            message: "something went wrong"
                        });
                    }
                    if (!project) {
                        return res.status(400).json({
                            message: "project not found"
                        });
                    }
                    res.status(200).json({
                        message: "project image uploaded successfully",
                        data: project
                    })
                })
            }).catch(error => {
                console.log(error);
                return res.status(500).json({
                    message: "something went wrong"
                });
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
}

//get borrowed cars
exports.getBorrowedCars = async (req, res) => {
    try {
        const cars = await BorrowCar.findOne({
            status: "borrowed"
        }).populate("carId").populate("userId");
        if (!cars) {
            return res.status(400).json({
                message: "no cars borrowed"
            });
        }
        res.status(200).json({
            message: "cars borrowed",
            data: cars
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
}

//get free cars
exports.getFreeCars = async (req, res) => {
    try {
        const cars = await Car.find({
            status: "free"
        });
        if (!cars) {
            return res.status(400).json({
                message: "no free cars"
            });
        }
        res.status(200).json({
            message: "free cars",
            data: cars
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
}