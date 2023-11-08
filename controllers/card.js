const Card = require("../models/Card");
const User = require("../models/User");

exports.createCard = (req, res, next) => {
  User.findById(req.body.user)
    .then((user) => {
      if (!user) {
        return res.status(400).json("Cet utilisateur n'existe pas !");
      } else {
        const card = new Card({
          user: user,
          card_type: req.body.card_type,
          id_card: req.body.id_card,
        });

        card
          .save()
          .then(() => {
            res
              .status(201)
              .json({ message: "Carte créée avec succès", card: card });
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

exports.viewCard = (req, res, next) => {};
