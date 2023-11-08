const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
});

mondule.exports = mongoose.model("Transaction", TransactionSchema);
