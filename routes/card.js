const express = require("express");

const cardCtrl = require("../controllers/card");

const router = express.Router();

router.post("/create", cardCtrl.createCard);
router.post("/view-card", cardCtrl.viewCard);

module.exports = router;
