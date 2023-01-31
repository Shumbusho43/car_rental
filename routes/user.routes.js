const express = require('express');
const {
    createUser,
    verifyEmail
} = require('../controller/user.cont');
const router = express.Router();
router.post('/signup', createUser);
router.get("/verify-email/:token", verifyEmail);
module.exports.userRouter = router;