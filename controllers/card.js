const Card = require("../models/Card");
const User = require("../models/User");

exports.createCard = async (req, res, next) => {
  User.findById(req.body.user)
    .then((user) => {
      if (!user) {
        return res.status(400).json("Cet utilisateur n'existe pas !");
      } else {
        const card = new Card({
          user: user,
          cardType: req.body.cardType,
          cardNumber: req.body.cardNumber,
        });

        card
          .save()
          .then(() => {
            res.status(201).json({ success: true, card: card });
          })
          .catch((error) => {
            console.error(error);
            res.status(400).json({ error });
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({ error });
    });
};

exports.viewCard = (req, res, next) => {
  console.log(req.params);
  Card.findOne({ user: req.params.user })
    .then((card) => {
      if (!card) {
        res.status(400).json({ message: "Utilisateur Introuvable" });
      } else {
        res.status(200).json({ card: card });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({ error });
    });
};
