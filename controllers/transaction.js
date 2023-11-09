const Transaction = require("../models/Transaction");
const User = require("../models/User");
const uuid = require("uuid");
const { ApiAuthenticationByReference } = require("../utils/api/authentication")

const externalTransactionId = uuid.v4();

const autorize = async () => {
  try {
    // Request For UUID Register
    const body = {
      providerCallbackHost: "MoMoCard",
    };

    let authHandler = new ApiAuthenticationByReference(externalTransactionId);
    let token = await authHandler.authenticate();

    console.log("Token: ", token);
    if (!token) {
      /// throw error here ?
    }
    /// next call with the token here
  } catch (error) {
    console.log(error);
  }
};

exports.refill = (req, res, next) => {
  const currency = "EUR";
  const serviceProviderUserName = "MoMoCard";
  const SubscriptionKey = "078933bfe87647b0a49024c377d1c468";

  User.findById(req.body.user)
    .then((user) => {
      if (!user) {
        res.status(400).json({ message: "L'utilisateur est introuvable" });
      } else {
        const body = {
          externalTransactionId: externalTransactionId,
          money: {
            amount: req.body.amount,
            currency: currency,
          },
          customerReference: req.body.partyId,
          serviceProviderUserName: "MoMoCard",
        };
        console.log(body);
        fetch("https://sandbox.momodeveloper.mtn.com/collection/v2_0/payment", {
          method: "POST",
          body: JSON.stringify(body),

          // Request headers
          headers: {
            Authorization: autorize,
            "X-Reference-Id": externalTransactionId,
            "X-Target-Environment": "sandbox",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Ocp-Apim-Subscription-Key": SubscriptionKey,
          },
        })
          .then((response) => {
            res.status(200).json({ response: response.text() });
            console.log(response.status);
            console.log(response.text());
          })
          .catch((err) => console.error(err));
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({ error });
    });
};

exports.receive = (req, res, next) => { };

exports.transfer = (req, res, next) => { };

exports.history = (req, res, next) => { };
