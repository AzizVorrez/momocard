const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  User.findOne({ phone_number: req.body.phone_number })
    .then((user) => {
      if (!user) {
        bcrypt
          .hash(req.body.password, 10)
          .then((hash) => {
            const user = new User({
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              phone_number: req.body.phone_number,
              password: hash,
            });

            user
              .save()
              .then(() => {
                res.status(201).json({ message: "Utilisateur créé !" });
              })
              .catch((error) => {
                console.log(error);
                res.status(400).json({ error });
              });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error });
          });
      } else {
        res.status(400).json({ message: "Cet utilisateur existe déjà !" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

exports.login = (req, res, next) => {
  console.log(req.body);
  User.findOne({ phone_number: req.body.phone_number })
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "Mot de passe incorrecte ! 1" });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res.status(401).json({ message: "Mot de passe incorrecte ! 2" });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
                  expiresIn: "24h",
                }),
              });
            }
          })
          .catch((error) => {
            console.log(error);
            res.status(400).json({ error });
          });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

exports.logout = (req, res, next) => {
  res.status(201).json("Déconnexion réussie !");
};
