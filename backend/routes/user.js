const { User, Account } = require("../db");
const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleWare } = require("../middleware");

const router = express.Router();
const zod = require("zod");

router.post("/signup", async function (req, res, next) {
  const signUpSchema = zod.object({
    username: zod.string(),
    password: zod.string().min(8),
    firstName: zod.string(),
    lastName: zod.string(),
  });

  const { success = false } = signUpSchema.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const existingUser = await User.findOne({
    username: req.body.username,
  });

  if (existingUser) {
    return res.status(411).json({
      message: "User already exists",
    });
  }

  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });

  const userId = user?._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  res.json({
    message: "User created successfully",
    token: token,
  });
});

router.post("/signin", async function (req, res, next) {
  const signInSchema = zod.object({
    username: zod.string(),
    password: zod.string().min(8),
  });

  const { success = false } = signInSchema.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const existingUser = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (!existingUser) {
    return res.status(411).json({
      message: "User does not exists",
    });
  }

  const token = jwt.sign(
    {
      userId: existingUser?._id,
    },
    JWT_SECRET
  );

  res.json({
    token: token,
    existingUser,
  });
});

router.put("/update", authMiddleWare, async function (req, res) {
  const updateProfileSchema = zod
    .object({
      password: zod.string().optional(),
      firstName: zod.string().optional(),
      lastName: zod.string().optional(),
    })
    .strict();

  const { success = false } = updateProfileSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const user = await User.updateOne(
    { _id: req.userId },
    {
      $set: req.body,
    }
  );

  res.json({
    message: "Updated successfully",
    user,
  });
});

router.get("/bulk", authMiddleWare, async function (req, res) {
  const query = req.query.filter;
  var regexForSearch = new RegExp(query, "i");

  const users = await User.find({
    $or: [
      { username: { $regex: regexForSearch } },
      { firstName: { $regex: regexForSearch } },
      { lastName: { $regex: regexForSearch } },
    ],
  });

  res.json({
    users,
  });
});

module.exports = router;
