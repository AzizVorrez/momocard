const express = require("express");
const userRoutes = require("./routes/user");
const transactionRoutes = require("./routes/transaction");
const cardRoutes = require("./routes/card");

const app = express();

app.use("/user/auth", userRoutes);
app.use("/transaction", transactionRoutes);
app.use("/card", cardRoutes);

module.exports = app;
