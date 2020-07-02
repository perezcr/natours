const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter
  const tranporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Cristian Pérez <perezcr@email.com>',
    to: options.email,
    suject: options.subject,
    text: options.message,
    // html:
  };

  // 3. Actually send the email
  await tranporter.sendMail(mailOptions);
};

module.exports = sendEmail;
