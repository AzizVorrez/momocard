const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", function (req, res) {
  console.log(req.body);
  res.send(200, req.body);
});

mongoose
  .connect("mongodb+srv://myuser:azerty@cluster0.walxwgm.mongodb.net/")
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

const userRoutes = require("./routes/user");
const transactionRoutes = require("./routes/transaction");
const cardRoutes = require("./routes/card");



app.use("/user/auth", userRoutes);
app.use("/transaction", transactionRoutes);
app.use("/card", cardRoutes);

module.exports = app;
