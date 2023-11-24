const User = require("../models/User");
const bcrypt = require("bcrypt");
const { error } = require("console");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const ApiAuthenticationByReference = require("../utils/api/authentication");
const uuid = require("uuid");
const { response } = require("express");
const Balance = require("../models/Balance");

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
  const SUBSCRIPTION_KEY = process.env.SUBSCRIPTION_KEY;
  const externalTransactionId = uuid.v4();
  const authHandler = new ApiAuthenticationByReference(externalTransactionId);
  const accessToken = await authHandler.authenticate();

  try {
    const otp = req.body.otp;

    const verifiedResponse = await client.verify
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+229${req.body.phoneNumber}`,
        code: otp,
      });

    if (verifiedResponse.status === "approved") {
      const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
      console.log("User trouvé -", user);

      if (!user) {
        const accountHolderMSISDN = req.body.phoneNumber;
        console.log("Téléphone de user", accountHolderMSISDN);

        try {
          const response = await fetch(
            `https://sandbox.momodeveloper.mtn.com/collection//v1_0/accountholder/msisdn/${accountHolderMSISDN}/basicuserinfo`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Target-Environment": "sandbox",
                "Cache-Control": "no-cache",
                "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
              },
            }
          );

          const data = await response.json();
          console.log("Data", data);

          const user = new User({
            userName: data.name,
            userGivenName: data.given_name,
            userFamilyName: data.family_name,
            userBirthdate: data.birthdate,
            userLocale: data.locale,
            userGender: data.gender,
            phoneNumber: req.body.phoneNumber,
            userPin: "",
            hasPin: false,
          });

          await user.save();

          const balance = new Balance({
            user: user._id,
            oldBalance: 0,
            enterAmount: 0,
            userBalance: 0,
          });

          await balance.save();

          const token = jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
            expiresIn: "24h",
          });
          res.status(200).json({
            message: "Nouvel utilisateur créé et OTP vérifié avec succès!",
            sendTo: verifiedResponse.to,
            status: verifiedResponse.status,
            valid: verifiedResponse.valid,
            user: user,
            token,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Erreur serveur interne" });
        }
      } else {
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
        console.log(user.card);
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
 * Déconnexion d'un utilisateur
 * @param req
 * @param res
 */
exports.logout = (req, res, next) => {
  res.status(201).json({ success: true });
};

/**
 * @param req
 * @param res
 */

exports.loginDev = async (req, res, next) => {
  try {
    const user = User.findOne({ phoneNumber: req.body.phoneNumber });
    if (!user && code === 1234) {
      // L'utilisateur n'existe pas, créons-le
      user = new User({
        phoneNumber,
        userPin: "",
        hasPin: false,
      });

      await user.save();
      const token = jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
        expiresIn: "24h",
      });
      res.status(200).json({
        message: "Nouvel utilisateur créé et OTP vérifié avec succès!",
        user: user,
        token,
      });
    } else {
      const token = jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
        expiresIn: "30m",
      });
      res.status(200).json({
        message: "OTP vérifié avec succès!",
        user: user._id,
        token,
      });
    }
  } catch (error) {
    res.status(error?.status || 400).json({
      message: error?.message || "Quelque chose s'est mal passé !",
    });
  }
};

exports.pinSet = async (req, res) => {
  try {
    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });

    if (user) {
      if (user.hasPin === false) {
        user.userPin = req.body.userPin;
        user.hasPin = true;
        user.save();

        res.status(200).json({ success: true, user });
      } else {
        res.status(400).json({ error: { code: "PIN_ALREADY_EXISTS" } });
      }
    } else {
      res.status(404).json({ error: { code: "USER_NOT_FOUND" } });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

exports.getUser = async (req, res) => {
  try {
    User.findOne({ phoneNumber: req.params.user })
      .then((user) => {
        if (user) {
          res.status(200).json({ success: true, user });
        } else {
          res.status(404).json({ error: { code: "USER_NOT_FOUND" } });
        }
      })
      .catch((err) => console.error(err));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};
