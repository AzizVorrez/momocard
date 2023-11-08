const express = require("express");

const cardCtrl = require("../controllers/card");

const router = express.Router();

router.post("/", cardCtrl.createCard);

module.exports = router;
