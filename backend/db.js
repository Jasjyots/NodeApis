const mongoose = require("mongoose");
const zod = require("zod");

const url = "mongodb+srv://jasjyots10:Dollar8@cluster0.k3av6ig.mongodb.net/";
mongoose.connect(url);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
});

const User = mongoose.model("User", userSchema);

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const Account = mongoose.model("Account", accountSchema);

module.exports = { User, Account };
