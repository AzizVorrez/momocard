const mongoose = require("mongoose");

const BalanceSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  oldBalance: { type: Number, required: false },
  enterAmount: { type: Number, required: false },
  userBalance: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Balance", BalanceSchema);
