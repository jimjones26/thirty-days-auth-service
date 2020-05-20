const jwt = require("jsonwebtoken");

const catchAsync = require("./../utils/catchAsync");
const userModel = require("./../models/userModel");
const {
  createMagicLinkToken,
  createAccessToken,
  createRefreshToken,
} = require("./../utils/generateJwt");
const { transporter, mailOptions } = require("./../utils/email");

/* POST /invite
  Handle user invite request
  - request route /invite with email and inviting id
  - check to see if user already exists
  - if exists, respond with user already exits
  - if not exists, create a new user with supplied email
  - link new user to inviting user
  - send invite email (will contain welcome text and magic link)
  - respond with success or error
*/
exports.invite = catchAsync(async (req, res, next) => {});

/* POST /login
  Handle user login request (send magic link)
  (this is the only route that does not require a valid cookie from a user)
  (however, a valid admin JWT will be required when requesting a user be added to Hasura)
*/
exports.login = catchAsync(async (req, res, next) => {
  // store email from request
  const { email } = req.body;

  // make sure email is not null and is well formed
  if (
    !email ||
    (email &&
      !email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ))
  ) {
    return res.status(400).json({
      status: "error",
      message: "a valid email is required",
    });
  }

  // store user associated with email in request
  const user = await userModel.getUserByEmail(email);

  if (user) {
    // if user exists, create a magic link login token
    const token = await createMagicLinkToken(user.id, user.email);

    // try to send email
    return transporter.sendMail(mailOptions(user.email, token), (error) => {
      if (error) {
        return res.status(500).json({
          status: "error",
          message: "cannot send email",
        });
      }
      return res.status(200).json({
        status: "success",
        message: `email to ${email} was successfully sent`,
      });
    });
  } else {
    // no user exists, return with 404 not found
    return res.status(404).json({
      status: "error",
      message: `user with email ${email} does not exist`,
    });
  }
});

/* POST /session
  Handle verifying magic link response (create tokens)
*/
exports.session = catchAsync(async (req, res, next) => {
  // store token from request
  const { token } = await req.body;

  // verify the token
  try {
    const verified = await jwt.verify(
      token,
      process.env.MAGIC_LINK_TOKEN_SECRET
    );

    // get the user associated with the verified token
    const user = await userModel.getUserById(verified.id);
    const scopeKeyArray = user.users_scopes.map(function (item) {
      return item.scope["name"];
    });

    // if there is no user, respond with not found
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "user not found",
      });
    } else {
      // create a refresh token
      const refreshToken = await createRefreshToken(
        user.id,
        user.token_version
      );

      // create an access token
      const accessToken = await createAccessToken(
        user.id,
        user.email,
        user.first_name,
        user.last_name,
        scopeKeyArray
      );

      // send the tokens in the response
      res.status(200).json({
        status: "success",
        message: "user session created",
        accessToken,
        refreshToken,
      });
    }
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "token is invalid",
    });
  }
});

/* POST /refresh_tokens
  Handle refreshing the access and refresh tokens
*/
exports.refresh_tokens = catchAsync(async (req, res, next) => {
  // store refresh token
  const refreshToken = req.body.refreshToken;

  // check validity of refresh token
  const decodedToken = await jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (error, decoded) => {
      if (error) {
        console.log("DECODE ERROR ", error);
        return null;
      } else {
        return decoded;
      }
    }
  );

  if (decodedToken) {
    // get user associated with token
    const user = await userModel.getUserById(decodedToken.id);
    const tokenVersionMatch = user.token_version === decodedToken.tokenVersion;

    const scopeKeyArray = user.users_scopes.map(function (item) {
      return item.scope["name"];
    });

    if (user && tokenVersionMatch) {
      const refreshToken = await createRefreshToken(
        user.id,
        user.token_version
      );

      // create an access token
      const accessToken = await createAccessToken(
        user.id,
        user.email,
        user.first_name,
        user.last_name,
        scopeKeyArray
      );

      // send the 2 tokens back in the response
      res.status(200).json({ refreshToken, accessToken });
    } else {
      res.status(403).json({
        status: "error",
        message: "unable to create new tokens",
      });
    }
  } else {
    // token is not valid
    res.status(403).json({
      status: "error",
      message: "refresh token is invalid",
    });
  }
});

/* POST /revoke_tokens
  Handle revoking tokens (logging user out)
  - get the user id from the cookie
  - update the user token version in persistence layer
  - send back new cookies with null values
*/

exports.revoke_tokens = catchAsync(async (req, res, next) => {
  const user = await userModel.getUserById(req.body.id);
  const updatedUserTokenVersion = await userModel.revokeRefreshToken(
    user.id,
    user.token_version + 1
  );
  res.status(200).json({
    status: "ok",
    message: `user tokens revoked`,
  });
});
