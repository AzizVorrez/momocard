const Transaction = require("../models/Transaction");
const User = require("../models/User");
const uuid = require("uuid");
const ApiAuthenticationByReference = require("../utils/api/authentication");

exports.refill = async (req, res, next) => {
  const externalTransactionId = uuid.v4();
  const serviceProviderUserName = "MoMoCard";
  const SubscriptionKey = "078933bfe87647b0a49024c377d1c468";

  try {
    const user = await User.findById(req.body.user);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Cet utilisateur n'existe pas !" });
    } else {
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
        customerReference: user.phone_number,
        serviceProviderUserName: serviceProviderUserName,
      };

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
          "Ocp-Apim-Subscription-Key": SubscriptionKey,
        },
      })
        .then((response) => {
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

exports.receive = (req, res, next) => {};

exports.transfer = (req, res, next) => {};

exports.history = (req, res, next) => {};