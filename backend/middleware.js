const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");

async function authMiddleWare(req, res, next) {
  const { authorization = "" } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      message: "UNAUTHORIZED",
    });
  }

  try {
    const decode = jwt.verify(authorization.split(" ")[1], JWT_SECRET);
    req.userId = decode?.userId;
    next();
  } catch (err) {
    res.status(401).json({
      message: "UNAUTHORIZED",
    });
  }
}

module.exports = { authMiddleWare };
