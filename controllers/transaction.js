const Transaction = require("../models/Transaction");
const User = require("../models/User");
const uuid = require("uuid");

const externalTransactionId = uuid.v4();
const serviceProviderUserName = "MoMoCard";

const autorization = (genereToken) => {
  // Request For UUID Register
  const body = {
    providerCallbackHost: serviceProviderUserName,
  };

  fetch("https://sandbox.momodeveloper.mtn.com/v1_0/apiuser", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "X-Reference-Id": externalTransactionId,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Ocp-Apim-Subscription-Key": "078933bfe87647b0a49024c377d1c468",
    },
  })
    .then((response) => {
      if (response.status != 201) {
        response.status(500).json({ message: "Internal Error !" });
      } else {
        // Request to Create API Key
        fetch(
          `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${externalTransactionId}/apikey`,
          {
            method: "POST",
            headers: {
              "Cache-Control": "no-cache",
              "Ocp-Apim-Subscription-Key": "078933bfe87647b0a49024c377d1c468",
            },
          }
        )
          .then((response) => {
            if (response.status != 201) {
              console.log(response.status);
              console.log(response.text());
            } else {
              // Request to Create Token
              fetch("https://sandbox.momodeveloper.mtn.com/collection/token/", {
                method: "POST",
                headers: {
                  Authorization:
                    "Basic ODlhNjE2ZjMtNGE2Zi00OGE0LWFhM2ItZDkyZjU1ZWE5YTE5OjQwNjQ5ZGZlZDc3ZjQ5Y2Q4MjQ3ZTg5MDJjYjQ4NDli",
                  "Cache-Control": "no-cache",
                  "Ocp-Apim-Subscription-Key":
                    "078933bfe87647b0a49024c377d1c468",
                },
              })
                .then((response) => {
                  console.log(response.status);
                  console.log(response.text());
                })
                .catch((err) => console.error(err));
            }
          })
          .catch((err) => console.error(err));
      }
    })
    .catch((err) => console.error(err));
};

exports.refill = (req, res, next) => {
  const currency = "EUR";
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
            Authorization: autorization,
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

exports.receive = (req, res, next) => {};

exports.transfer = (req, res, next) => {};

exports.history = (req, res, next) => {};
