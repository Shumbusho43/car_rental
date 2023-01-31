const express = require('express');
const {
    createUser,
    verifyEmail,
    login
} = require('../controller/user.cont');
const router = express.Router();
router.post('/signup', createUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login)
module.exports.userRouter = router;