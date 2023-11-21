const express = require("express");
const auth = require("../middleware/user");
const userCtrl = require("../controllers/user");

const router = express.Router();

router.post("/login", userCtrl.login);
router.post("/signup", userCtrl.signup);
router.post("/logout", auth, userCtrl.logout);
router.post("/otp/login", userCtrl.loginOtp);
router.post("/login-dev", userCtrl.loginDev);
router.patch("/set-pin", auth, userCtrl.pinSet);
router.get("/:user", auth, userCtrl.getUser);

module.exports = router;
