const express = require("express");

const balanceCtrl = require("../controllers/balance");

const router = express.Router();

router.get("/get-balance/:user", balanceCtrl.getBalance);

module.exports = router;
