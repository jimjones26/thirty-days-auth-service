const nodemailer = require('nodemailer')

module.exports.transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '75f36973dda726',
    pass: 'e8d2f7a31e2cd4'
  }
})

module.exports.magicLinkEmailTemplate = ({ email, link }) =>
  `
    <p>
      <b>Hello ${email}</b>
    </p>
    <p>Please <a href="${link}">click this link</a> to login to this app.</p>
  `
