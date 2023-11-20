const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Envoi d'un code OTP
 * @param req
 * @param res
 */
exports.sendOtp = async (req, res, next) => {
  const { phoneNumber } = req.body;

  try {
    const otpResponse = await client.verify
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+229${phoneNumber}`,
        channel: "sms",
      });
    res
      .status(200)
      .json({ SendTo: otpResponse.to, Status: otpResponse.status });
  } catch (error) {
    res
      .status(error?.status || 400)
      .send(error?.message || "Quelques choses s'est mal passé !");
  }
};

/**
 * Connexion avec OTP
 * @param req
 * @param res
 */

exports.loginOtp = async (req, res, next) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    const otp = req.body.otp;

    const verifiedResponse = await client.verify
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+229${phoneNumber}`,
        code: otp,
      });

    if (verifiedResponse.status === "approved") {
      // L'OTP est correct, vérifions si l'utilisateur existe
      let user = await User.findOne({ phoneNumber });

      if (!user) {
        // L'utilisateur n'existe pas, créons-le
        user = new User({
          phoneNumber,
          userPin: "",
          hasPin: false,
        });

        await user.save();
        const token = jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
          expiresIn: "30m",
        });
        res.status(200).json({
          message: "Nouvel utilisateur créé et OTP vérifié avec succès!",
          sendTo: verifiedResponse.to,
          status: verifiedResponse.status,
          valid: verifiedResponse.valid,
          user: user,
          token,
        });
      } else {
        // L'utilisateur existe, renvoyons les détails de l'utilisateur
        await user.save();
        const token = jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
          expiresIn: "30m",
        });
        res.status(200).json({
          message: "OTP vérifié avec succès!",
          sendTo: verifiedResponse.to,
          status: verifiedResponse.status,
          valid: verifiedResponse.valid,
          user: user,
          token,
        });
      }
    } else {
      // L'OTP est incorrect
      res.status(401).json({
        message: "Le code OTP est incorrect.",
      });
    }
  } catch (error) {
    res.status(error?.status || 400).json({
      message: error?.message || "Quelque chose s'est mal passé !",
    });
  }
};

/**
 * Inscription d'un utilisateur
 * @param req
 * @param res
 */
exports.signup = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    });

    if (!existingUser) {
      const hash = await bcrypt.hash(req.body.userPin, 10);
      const newUser = new User({
        phoneNumber: req.body.phoneNumber,
        userPin: hash,
        hasPin: true,
      });

      await newUser.save();
      res.status(201).json({ message: "Utilisateur créé !", newUser });
    } else {
      res
        .status(400)
        .json({ message: "Cet utilisateur existe déjà !", existingUser });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

/**
 * Connexion d'un utilisateur
 * @param req
 * @param res
 */
exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });

    if (!user) {
      res.status(401).json({ message: "Mot de passe incorrecte !" });
    } else {
      const validPassword = await bcrypt.compare(
        req.body.userPin,
        user.userPin
      );

      if (!validPassword) {
        res.status(401).json({ message: "Mot de passe incorrecte !" });
      } else {
        const token = jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
          expiresIn: "30m",
        });

        res.status(200).json({ userId: user._id, token });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

/**
 * Connexion par OTP
 * @param req
 * @param res
 */
exports.loginOpt = (req, res) => {
  client.messages
    .create({
      body: "This is the ship that made the Kessel Run in fourteen parsecs?",
      from: "+22961780195",
      to: req.phone_number,
    })
    .then((message) => console.log(message.sid));
};

/**
 * Déconnexion d'un utilisateur
 * @param req
 * @param res
 */
exports.logout = (req, res, next) => {
  res.status(201).json("Déconnexion réussie !");
};

/**
 * @param req
 * @param res
 */

exports.loginDev = async (req, res, next) => {
  try {
    const user = User.findOne({ phoneNumber: req.body.phoneNumber });
    console.log(user);
    if (user) {
      code = req.body.code;
      console.log(code);
      if (code === 1234) {
        const token = jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
          expiresIn: "30m",
        });
        res.status(200).json({ token });
      } else {
        res.status(400).json({ message: "Code incorrect" });
      }
    } else {
      res.status(400).json({ message: "Cet utilisateur n'existe pas !" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

exports.pinSet = async (req, res) => {
  try {
    userId = req.body.userId;
    const user = User.findById(userId);

    if (user) {
      if (user.hasPin === false) {
        userUpdate = new User({
          userPin: req.body.userPin,
          hasPin: true,
        });
        await userUpdate.save();

        res.status(200).json({ user });
      } else {
        res.status(400).json({ message: "This user has Pin !" });
      }
    } else {
      res.status(404).json({ message: "This doesn't exist !" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};