const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.signup = (req, res, next) => {
  console.log(req.body);
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
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => {
      console.error(error); // Loggez l'erreur ici pour voir ce qui ne fonctionne pas
      res.status(500).json({ error }); // Retournez l'erreur dans la réponse pour le débogage
    });
};

exports.login = (req, res, next) => {
  res.end("Ceci est un test !");
};

exports.user = (req, res, next) => {};

exports.logout = (req, res, next) => {};
