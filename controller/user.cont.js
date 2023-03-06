//user managment APIs
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {
    User,
    validateUserModel,
    validateUserLogin
} = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

//create user
exports.createUser = async (req, res, next) => {
    try {
        const {
            name,
            email,
            phone,
            password
        } = req.body;
        //check if user exist
        const exist = await User.findOne({
            email
        });
        if (exist) {
            return res.status(400).json({
                status: "fail",
                message: "User already exist"
            })
        }
        //phone exist
        const phoneExist = await User.findOne({
            phone
        });
        if (phoneExist) {
            return res.status(400).json({
                status: "fail",
                message: "Phone number already exist"
            })
        }
        //validate request
        const {
            error
        } = await validateUserModel(req.body);

        if (error) {
            const message = error.details[0].message.split('"').join('');
            return res.status(400).json({
                status: "fail",
                message
            });
        }
        const user = await new User({
            name,
            email,
            phone,
            password
        });
        const verificationToken = user.createEmailVerificationToken();

        await user.save();
        //send verification email
        const verificationURL = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking on this link: ${verificationURL}`;
        try {
            const result = await sendEmail({
                from: 'davidshumbusho10@gmail.com',
                to: email,
                subject: 'Verify your email',
                message
            });
            res.status(200).json({
                status: "success",
                message: "Verification email sent to email"
            });
        } catch (error) {
            console.log(error);
            user.emailVerificationToken = undefined;
            user.emailVerificationTokenExpires = undefined;
            await user.save({
                validateBeforeSave: false
            });
            return res.status(500).json({
                message: 'There was an error sending the email. Try again later!'
            })
        }
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}

//verify email address 
exports.verifyEmail = async (req, res, next) => {
    const {
        token
    } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    //find user with token
    const user = await User.findOne({
        emailVerificationToken: hashedToken
    });
    if (!user) {
        return res.status(400).json({
            status: "fail",
            message: "Invalid token"
        })
    }
    //check if token has expired
    const tokenExpired = Date.now() > user.emailVerificationTokenExpires;
    if (tokenExpired) {
        return res.status(400).json({
            status: "fail",
            message: "Token has expired"
        })
    }
    //update user
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();
    res.status(200).json({
        status: "success",
        message: "Email verified successfully"
    })
}
//login
exports.login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;
        //validate request
        const {
            error
        } = await validateUserLogin(req.body);
        if (error) {
            const message = error.details[0].message.split('"').join('');
            return res.status(400).json({
                status: "fail",
                message
            });
        }
        //check if user exist
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid credentials"
            })
        }
        //check if password is correct
        const isPasswordCorrect = await user.comparePassword(password, user.password);
        // console.log(isPasswordCorrect);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid credentials"
            })
        }
        //create token
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
        res.cookie('jwt', token, {
            httpOnly: true
        });
        return res.status(200).json({
            status: "success",
            token
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send("internal server error")
    }
}
//getting logged in user
exports.getLoggedInUser = async (req, res, next) => {
    try {
        const {
            id
        } = req.user;
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                status: "fail",
                message: "User does not exist"
            })
        }
        res.status(200).json({
            status: "success",
            data: user
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send("internal server error")
    }
}

//getting all users
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({
            status: "success",
            data: users
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send("internal server error")
    }
}
//getting a single user
exports.getSingleUser = async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                status: "fail",
                message: "User does not exist"
            })
        }
        res.status(200).json({
            status: "success",
            data: user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send("internal server error")
    }
}