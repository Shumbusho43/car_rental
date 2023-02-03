const express = require('express');
const {
    createUser,
    verifyEmail,
    login,
    getAllUsers,
    getSingleUser,
    getLoggedInUser
} = require('../controller/user.cont');
const {
    protect
} = require('../utils/protect');
const router = express.Router();
router.post('/signup', createUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login)
router.get("/", protect, getAllUsers)
router.get("/:id", protect, getSingleUser)
router.get("/me", protect, getLoggedInUser)
module.exports.userRouter = router;