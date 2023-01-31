//user managment APIs
const crypto = require('crypto');
const {
    User,
    validateUserModel
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