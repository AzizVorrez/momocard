const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
  phoneNumber: { type: String, required: true },
  userPin: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
  hasPin: { type: Boolean, default: false },
  userName: { type: String, required: true },
  userGivenName: { type: String, required: true },
  userFamilyName: { type: String, required: true },
  userBirthdate: { type: String, required: true },
  userLocale: { type: String, required: true },
  userGender: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema);
