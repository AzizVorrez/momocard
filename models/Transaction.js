const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  externalId: { type: String, required: true },
  partyIdType: { type: String, required: true },
  partyId: { type: String, required: true },
  payerMessage: { type: String, required: true },
  payeeNote: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
