const Joi = require('joi');
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
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
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
//compare password with bcrypt
userSchmema.methods.comparePassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}
//validate with joi
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        phone: Joi.string().required(),
        password: Joi.string().min(8).max(255).required(),
        emailVerified: Joi.boolean(),
        emailVerificationToken: Joi.string(),
        emailVerificationTokenExpires: Joi.date(),
        createdAt: Joi.date(),
        role: Joi.string().valid('client', 'admin', 'owner'),
        repeat_password: Joi.ref('password'),
    })
    return schema.validate(user);
}
//login
//validate with joi
function validateUserLogin(user) {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().min(8).max(255).required(),
    })
    return schema.validate(user);
}
module.exports.validateUserModel = validateUser;
module.exports.validateUserLogin = validateUserLogin;
module.exports.User = mongoose.model('User', userSchmema);