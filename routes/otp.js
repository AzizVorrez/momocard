const express = require("express");
const otpCtrl = require("../controllers/user");

const router = express.Router();

router.post("/send-otp", otpCtrl.sendOtp);
router.post("/login-otp", otpCtrl.loginOtp);

module.exports = router;
