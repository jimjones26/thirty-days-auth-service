const jwt = require('jsonwebtoken')

// needs to be able to generate magic link token, refresh token and access token
// params: userid, token secret, expiration time, token version
module.exports.createMagicLinkToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.MAGIC_LINK_TOKEN_SECRET, {
    expiresIn: '1hr'
  })
}

// generate new tokens
module.exports.createRefreshToken = (id, tokenVersion) => {
  // grab the user and increment the tokenVersion
  return jwt.sign({ id, tokenVersion }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  })
}

module.exports.createAccessToken = id => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  })
}

/* export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' })
}

export const createRefreshToken = (user: User) => {
  return sign({ userId: user.id, tokenVersion: user.tokenVersion }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' })
}
 */
