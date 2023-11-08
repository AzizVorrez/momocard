const express = require("express");

const cardCtrl = require("../controllers/card");

const router = express.Router();

router.post("/create", cardCtrl.createCard);
router.get("/view-card/:user", cardCtrl.viewCard);

module.exports = router;