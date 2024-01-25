const express = require("express");
const { authMiddleWare } = require("../middleware");

const router = express.Router();
const userRouter = require("./user");
const accountRouter = require("./account");

router.use("/user", userRouter);
router.use("/account", accountRouter);

router.get("/profile", authMiddleWare, function (req, res) {
  res.json({
    messgage: "User found",
  });
});

module.exports = router;
