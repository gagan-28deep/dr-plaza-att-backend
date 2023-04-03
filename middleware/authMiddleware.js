const jwt = require("jsonwebtoken");
const secret = require("../secrets");
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  //   console.log("Auth", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  //   console.log("Token", token);
  if (token == null) {
    res.json({
      message: "Unauthorized User",
    });
  } else {
    jwt.verify(token, secret.JWT_KEY, (err, user) => {
      if (err) {
        console.log("Error->", err);
        res.json({
          message: err.message,
        });
      } else {
        next();
      }
    });
  }
}

module.exports = authMiddleware;
