const express = require("express");
const { Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleWare } = require("../middleware");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleWare, async function (req, res) {
  const userAccount = await Account.findOne({
    userId: req.userId,
  });

  res.json({ user: userAccount });
});

router.post("/transfer", authMiddleWare, async function (req, res) {
  const session = await mongoose.startSession();

  session.startTransaction();
  const { receiver = "", amount = "" } = req.body;

  const account = await Account.findOne({ userId: req.userId }).session(
    session
  );

  if (!account || account.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }

  const toAccount = await Account.findOne({ userId: receiver }).session(
    session
  );

  if (!toAccount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Invalid account",
    });
  }

  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);

  await Account.updateOne(
    { userId: receiver },
    { $inc: { balance: amount } }
  ).session(session);

  await session.commitTransaction();

  res.json({
    message: "Transfer Successful",
  });
});

module.exports = router;
