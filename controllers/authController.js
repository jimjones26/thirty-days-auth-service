const catchAsync = require('./../utils/catchAsync')
const userModel = require('./../models/userModel')
const {
  createMagicLinkToken,
  createAccessToken,
  createRefreshToken
} = require('./../utils/generateJwt')
const { transporter, magicLinkEmailTemplate } = require('./../utils/email')

/*
this route creates a JWT that is sent in a magic link email

for existing users, the token version for the refresh token should be
incremented by 1, which will invalidate the refresh token and the current
access token.

for new users, a user should be created first, and then the magic link JWT
created and sent.
*/
exports.login = catchAsync(async (req, res, next) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'an email is required'
    })
  }

  const user = await userModel.getUserByEmail(email)

  const token = await createMagicLinkToken(user.id, user.email)

  const mailOptions = {
    from: 'sender@server.com',
    html: magicLinkEmailTemplate({
      email,
      link: `localhost:3000/auth/verify-email/${token}`
    }),
    subject: 'Invitation',
    to: email
  }

  return transporter.sendMail(mailOptions, error => {
    if (error) {
      return res.status(500).json({
        status: 'fail',
        message: 'cannot send email'
      })
    }
    return res.status(200).json({
      status: 'success',
      message: `email to ${email} was successfully sent`
    })
  })
})

/* 
now i need a route that takes a user id and generates a refresh token and an access token
then sends it back in the response
*/
exports.refresh_tokens = catchAsync(async (req, res, next) => {
  const user = await userModel.getUserById(req.body.id)

  if (user) {
    // increment the token version
    const newTokenVersion = user.token_version + 1
    console.log('NEW TOKEN VERSION: ', newTokenVersion)

    // create a refresh token
    const refreshToken = await createRefreshToken(user.id, newTokenVersion)
    console.log('REFRESH TOKEN: ', refreshToken)

    // save the new token version to the user to revoke all previous refresh tokens
    const updatedUserTokenVersion = await userModel.revokeRefreshToken(
      user.id,
      newTokenVersion
    )
    console.log('UPDATED USER TOKEN VERSION: ', updatedUserTokenVersion)

    // create an access token
    const accessToken = await createAccessToken(user.id)
    console.log('ACCESS TOKEN: ', accessToken)

    // send the 2 tokens back in the response
    res.status(200).json({ refreshToken, accessToken })
  }
})

/* 
i need a route that invalidates a refresh token. It does this by changing the tokenVersion field
on the user record. The next time the users access token expires, the app will try to get a new access and refresh token by validating the refresh token and making sure it's tokenVersion is greater than or equal to the tokenVersion field on the user record. When this check fails, no new tokens will be issued, effectively logging the user out.

this could happen when a user hits a logout route, or when the refreshToken expires
*/
exports.revoke_refresh_tokens = catchAsync(async (req, res, next) => {})
