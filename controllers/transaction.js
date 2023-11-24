const Transaction = require("../models/Transaction");
const User = require("../models/User");
const uuid = require("uuid");
const ApiAuthenticationByReference = require("../utils/api/authentication");
const Balance = require("../models/Balance");

exports.refill = async (req, res, next) => {
  const externalTransactionId = uuid.v4();
  const serviceProviderUserName = "MoMoCard";
  const SUBSCRIPTION_KEY = process.env.SUBSCRIPTION_KEY;

  try {
    const user = await User.findById(req.body.user);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Cet utilisateur n'existe pas !" });
    } else {
      /*
      Pour lancer la création du access_token
        1 - Enregistremment du uuid généré ici,
        2 - Génération du api_key,
        3 - Génération du access_token
      */
      const authHandler = new ApiAuthenticationByReference(
        externalTransactionId
      );

      // Appeler la méthode authenticate pour obtenir l'access_token
      const accessToken = await authHandler.authenticate();

      const body = {
        externalTransactionId: externalTransactionId,
        money: {
          amount: req.body.amount,
          currency: "EUR",
        },
        customerReference: req.body.partyId,
        serviceProviderUserName: serviceProviderUserName,
      };
      console.log({ "REFERENCE CUSTOMER - ": req.body.partyId });
      fetch("https://sandbox.momodeveloper.mtn.com/collection/v2_0/payment", {
        method: "POST",
        body: JSON.stringify(body),
        // Request headers
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Reference-Id": externalTransactionId,
          "X-Target-Environment": "sandbox",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
        },
      })
        .then(async (response) => {
          if (response.status != 202) {
            res.status(400).json({ error: { code: "PAYMENT_FAILED" } });
          } else {
            const transaction = new Transaction({
              user: user,
              amount: req.body.amount,
              currency: "EUR",
              externalId: externalTransactionId,
              partyIdType: req.body.partyIdType,
              partyId: req.body.partyId,
              payerMessage: req.body.payerMessage,
              payeeNote: req.body.payeeNote,
              transactionType: "credit",
            });
            await transaction.save();

            const balance = await Balance.findOne({ user: req.body.user });

            if (balance) {
              balance.oldBalance = balance.userBalance;
              balance.userBalance = balance.oldBalance + transaction.amount;
              balance.enterAmount = transaction.amount;

              await balance.save();
            } else {
              res.status(500).json({ error: { code: "INTERNAL_ERROR " } });
            }

            res.status(202).json({
              success: true,
              oldBalance: balance.oldBalance,
              enterAmount: balance.enterAmount,
              newBalance: balance.userBalance,
            });
          }
        })
        .catch((err) => console.error(err));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};

exports.receive = async (req, res) => {
  const sender = await Card.findOne({ user: req.boby.cardId });

  console.log(sender);

  if (sender) {
    const transaction = new Transaction({
      user: user,
      amount: req.body.amount,
      currency: "EUR",
      externalId: externalTransactionId,
      partyIdType: req.body.partyIdType,
      partyId: req.body.partyId,
      payerMessage: req.body.payerMessage,
      payeeNote: req.body.payeeNote,
      transactionType: "debit",
    });
    await transaction.save();
    const recever = await User.findById(req.body.userId);
    console.log(recever);
    if (recever) {
      const transaction = new Transaction({
        user: user,
        amount: req.body.amount,
        currency: "EUR",
        externalId: externalTransactionId,
        partyIdType: req.body.partyIdType,
        partyId: req.body.partyId,
        payerMessage: req.body.payerMessage,
        payeeNote: req.body.payeeNote,
        transactionType: "credit",
      });
      await transaction.save();
    } else {
      res.status(404).json({ error: { code: "USER_NOT_FOUND " } });
    }
  } else {
    res.status(404).json({ error: { code: "USER_NOT_FOUND " } });
  }
};

exports.transfer = async (req, res, next) => {};

exports.historyMin = async (req, res, next) => {
  try {
    const userId = req.params.user; // Utilisez req.params.user pour obtenir l'ID de l'utilisateur depuis les paramètres de l'URL

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Cet utilisateur n'existe pas !" });
    }

    const transactions = await Transaction.find({ user: userId }).limit(5);

    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.historyAll = async (req, res, next) => {
  try {
    const userId = req.params.user; // Utilisez req.params.user pour obtenir l'ID de l'utilisateur depuis les paramètres de l'URL

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Cet utilisateur n'existe pas !" });
    }

    const transactions = await Transaction.find({ user: userId });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};