const catchAsync = require("./../utils/catchAsync");
const userModel = require("./../models/userModel");
const {
  createMagicLinkToken,
  createAccessToken,
  createRefreshToken,
} = require("./../utils/generateJwt");
const { transporter, magicLinkEmailTemplate } = require("./../utils/email");

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

/* POST /login
  Handle user login request (send magic link)
  - grab email from request
  - make sure email is in valid form
  - make sure user exists
    - if yes, continue
    - if no, respond with user not found
  - send magic link email
  - respond with success, access cookie and refresh cookie
*/

/* POST /session
  Handle verifying magic link response (create tokens)
  - grab token from reponse url
  - verify token
    - if valid, continue
    - if invalid, throw invlaid token error
  - create new access token
  - ceate new access token cookie
  - create new refresh token
  - create new refresh token cookie
*/

/* POST /refresh_tokens
  Handle refreshing the access and refresh tokens
  - check the validity of the refresh token
  - if valid, check for existence of user
  - if invalid, throw error
  - check that user token version matches refresh token version
  - if match, continue
  - if not match, send back access and token cookies with null values
  - create new access token
  - create new access token cookie
  - create new refresh token
  - create new refresh token cookie
  - respond with new cookies
*/

/* POST /revoke_tokens
  Handle revoking tokens (logging user out)
  - get the user id from the cookie
  - update the user token version in persistence layer
  - send back new cookies with null values
*/

// handles sending the magic link to the users email
exports.login = catchAsync(async (req, res, next) => {
  // TODO: how to make sure email is well formed?
  const { email } = req.body;
  if (
    !email ||
    (email &&
      !email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ))
  ) {
    return res.status(400).json({
      status: "error",
      message: "an email is required",
    });
  }

  const user = await userModel.getUserByEmail(email);

  const token = await createMagicLinkToken(user.id, user.email);

  // TODO: put mail options config into environment variables
  const mailOptions = {
    from: "sender@server.com",
    html: magicLinkEmailTemplate({
      email,
      link: `localhost:3000/auth/verify-email/${token}`,
    }),
    subject: "Invitation",
    to: email,
  };

  return transporter.sendMail(mailOptions, (error) => {
    if (error) {
      return res.status(500).json({
        status: "fail",
        message: "cannot send email",
      });
    }
    return res.status(200).json({
      status: "success",
      message: `email to ${email} was successfully sent`,
    });
  });
});

exports.create_tokens = catchAsync(async (req, res, next) => {
  const user = await userModel.getUserById(req.body.id);

  if (user) {
    // create a refresh token
    const refreshToken = await createRefreshToken(user.id, user.token_version);

    // create an access token
    const accessToken = await createAccessToken(
      user.id,
      user.email,
      user.first_name,
      user.last_name
    );

    // send the 2 tokens back in the response
    res.status(200).json({ refreshToken, accessToken });
  }
});

exports.refresh_tokens = catchAsync(async (req, res, next) => {
  const user = await userModel.getUserById(req.body.id);
  const tokenVersionMatch = user.token_version === req.body.tokenVersion;

  if (user && tokenVersionMatch) {
    const refreshToken = await createRefreshToken(user.id, user.token_version);

    // create an access token
    const accessToken = await createAccessToken(
      user.id,
      user.email,
      user.first_name,
      user.last_name
    );

    // send the 2 tokens back in the response
    res.status(200).json({ refreshToken, accessToken });
  } else {
    res.status(200).json({ refreshToken: null, accessToken: null });
  }
});

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
