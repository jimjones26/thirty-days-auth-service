const jwt = require("jsonwebtoken");

module.exports.createMagicLinkToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.MAGIC_LINK_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

module.exports.createRefreshToken = (id, tokenVersion) => {
  return jwt.sign({ id, tokenVersion }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

module.exports.createAccessToken = (id, email, firstName, lastName, scope) => {
  return jwt.sign(
    { id, email, firstName, lastName, scope },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
};
