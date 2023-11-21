const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
  phoneNumber: { type: String, required: true },
  userPin: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
  hasPin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
