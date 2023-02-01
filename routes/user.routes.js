const express = require('express');
const {
    createUser,
    verifyEmail,
    login,
    getAllUsers,
    getSingleUser,
    getLoggedInUser
} = require('../controller/user.cont');
const router = express.Router();
router.post('/signup', createUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login)
router.get("/", getAllUsers)
router.get("/:id", getSingleUser)
router.get("/me", getLoggedInUser)
module.exports.userRouter = router;