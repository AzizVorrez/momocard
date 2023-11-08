const express = require("express");
const auth = require("../middleware/user");
const transactionCtrl = require("../controllers/transaction");

const router = express.Router();

router.post("/refill", auth, transactionCtrl.refill);
router.post("/receive", auth, transactionCtrl.receive);
router.post("/transfer", auth, transactionCtrl.transfer);
router.get("/history", auth, transactionCtrl.history);

module.exports = router;
