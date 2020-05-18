const nodemailer = require("nodemailer");

module.exports.transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "75f36973dda726",
    pass: "e8d2f7a31e2cd4",
  },
});

const magicLinkEmailTemplate = ({ email, link }) =>
  `<p>
      <b>Hello ${email}</b>
    </p>
    <p>Please <a href="${link}">click this link</a> to login to this app.</p>`;

module.exports.mailOptions = (email, token) => {
  return {
    from: "sender@server.com",
    html: magicLinkEmailTemplate({
      email,
      link: `localhost:3000/verify-email/${token}`,
    }),
    subject: "Invitation",
    to: email,
  };
};
