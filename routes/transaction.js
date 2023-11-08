const express = require("express");
const transactionCtrl = require("../controllers/transaction");

const router = express.Router();

router.post("/refill", transactionCtrl.refill);
router.post("/receive", transactionCtrl.receive);
router.post("/transfer", transactionCtrl.transfer);
router.get("/history", transactionCtrl.history);

module.exports = router;
