const Joi = require('joi');
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userSchmema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['client', 'admin', 'owner'],
        default: 'client'
    },
    password: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationTokenExpires: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
userSchmema.methods.createEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log(verificationToken);
    this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationTokenExpires = Date.now() + 10 * 60 * 1000;
    return verificationToken;
}
//hashing password 
userSchmema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await jwt.sign(this.password, process.env.JWT_SECRET);
    next();
});
//compare password
userSchmema.methods.comparePassword = async function (candidatePassword, userPassword) {
    return await jwt.verify(candidatePassword, process.env.JWT_SECRET) === userPassword;
}
//validate with joi
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        phone: Joi.string().required(),
        password:Joi.string().min(8).max(255).required(),
        emailVerified: Joi.boolean(),
        emailVerificationToken: Joi.string(),
        emailVerificationTokenExpires: Joi.date(),
        createdAt: Joi.date(),
        role: Joi.string().valid('client', 'admin', 'owner'),
        repeat_password: Joi.ref('password'),
    })
    return schema.validate(user);
}
module.exports.validateUserModel = validateUser;
module.exports.User = mongoose.model('User', userSchmema);