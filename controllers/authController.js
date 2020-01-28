const catchAsync = require('./../utils/catchAsync')
const userModel = require('./../models/userModel')
const {
  createMagicLinkToken,
  createAccessToken,
  createRefreshToken
} = require('./../utils/generateJwt')
const { transporter, magicLinkEmailTemplate } = require('./../utils/email')

exports.login = catchAsync(async (req, res, next) => {
  // TODO: how to make sure email is well formed?
  const { email } = req.body
  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'an email is required'
    })
  }

  const user = await userModel.getUserByEmail(email)

  const token = await createMagicLinkToken(user.id, user.email)

  // TODO: put mail options config into environment variables
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

exports.create_tokens = catchAsync(async (req, res, next) => {
  const user = await userModel.getUserById(req.body.id)

  if (user) {
    // create a refresh token
    const refreshToken = await createRefreshToken(user.id, user.token_version)
    console.log('REFRESH TOKEN: ', refreshToken)

    // create an access token
    const accessToken = await createAccessToken(
      user.id,
      user.email,
      user.first_name,
      user.last_name
    )
    console.log('ACCESS TOKEN: ', accessToken)

    // send the 2 tokens back in the response
    res.status(200).json({ refreshToken, accessToken })
  }
})

exports.refresh_tokens = catchAsync(async (req, res, next) => {
  const user = await userModel.getUserById(req.body.id)
  const tokenVersionMatch = user.token_version === req.body.tokenVersion

  if (user && tokenVersionMatch) {
    const refreshToken = await createRefreshToken(user.id, user.token_version)
    console.log('REFRESH TOKEN: ', refreshToken)

    // create an access token
    const accessToken = await createAccessToken(
      user.id,
      user.email,
      user.first_name,
      user.last_name
    )
    console.log('ACCESS TOKEN: ', accessToken)

    // send the 2 tokens back in the response
    res.status(200).json({ refreshToken, accessToken })
  } else {
    res.status(200).json({ refreshToken: null, accessToken: null })
  }
})

exports.revoke_tokens = catchAsync(async (req, res, next) => {
  console.log('CALLA: ', req.body.id)

  const user = await userModel.getUserById(req.body.id)
  const updatedUserTokenVersion = await userModel.revokeRefreshToken(
    user.id,
    user.token_version + 1
  )
  console.log(
    `old token version: ${user.token_version}; new token version: ${updatedUserTokenVersion.token_version}`
  )
  res.status(200).json({
    status: 'ok',
    message: `user tokens revoked prior to version ${updatedUserTokenVersion.token_version}`
  })
})
