const Balance = require("../models/Balance");
const User = require("../models/User");

exports.getBalance = async (req, res) => {
  const user = await User.findOne({ phoneNumber: req.params.user });

  if (user) {
    const balance = await Balance.findOne({ user: user._id });

    res.status(200).json({ user: balance.user, balance: balance.userBalance });
  } else {
    res.status(404).json({ error: { code: "USER_NOT_FOUND" } });
  }
};