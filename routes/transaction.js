const express = require("express");
const auth = require("../middleware/user");
const transactionCtrl = require("../controllers/transaction");

const router = express.Router();

router.post("/refill", auth, transactionCtrl.refill);
router.post("/receive", auth, transactionCtrl.receive);
router.post("/transfer", auth, transactionCtrl.transfer);
router.get("/history-min/:user", auth, transactionCtrl.historyMin);
router.get("/history-all/:user", auth, transactionCtrl.historyAll);

module.exports = router;
