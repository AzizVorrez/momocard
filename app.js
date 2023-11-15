const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

app.use(express.json());

app.post("/", function (req, res) {
  console.log(req.body);
  res.send(200, req.body);
});

mongoose
  .connect(process.env.MONGODB_URI)
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
const otpRoutes = require("./routes/otp");

app.use("/user/auth", userRoutes);
app.use("/transaction", transactionRoutes);
app.use("/card", cardRoutes);
app.use("/otp", otpRoutes);

module.exports = app;