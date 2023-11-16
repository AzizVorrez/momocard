const Transaction = require("../models/Transaction");
const User = require("../models/User");
const uuid = require("uuid");
const ApiAuthenticationByReference = require("../utils/api/authentication");

exports.refill = async (req, res, next) => {
  const externalTransactionId = uuid.v4();
  const serviceProviderUserName = "MoMoCard";
  const SUBSCRIPTION_KEY = process.env.SUBSCRIPTION_KEY;
  console.log(req.body);

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
        .then((response) => {
          console.log(response);
          if (response.status != 202) {
            res.status(400).json({ message: "Paiement échoué" });
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
              transactionType: req.body.transactionType,
            });
            transaction.save();
            res.status(202).json({ message: "Paiement effectué !" });
          }
        })
        .catch((err) => console.error(err));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};

exports.receive = async (req, res, next) => {
  try {
    const cardExist = Card.findById(req.body.cardId);

    if (cardExist) {
      // Ici nous récupère l'ID de la carte et je l'associe à l'ID de l'user !

      userId = req.body.idCard;
      const user = await User.findById(userId);

      if (user) {
        res.status(200).json({ message: "Tout se passe très bien  !" });
      } else {
        res.status(400).json({
          message: "Utilisateur lié à la carte n'a pas pu être trouvé !",
        });
      }
    } else {
      res.status(400).json({ message: "Cette carte n'existe pas !" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
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