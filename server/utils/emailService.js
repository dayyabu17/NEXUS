const nodemailer = require('nodemailer');

// Reusable transporter configured with environment credentials.
const { EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_FROM_NAME } = process.env;

const transporter = EMAIL_USER && EMAIL_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })
  : null;

const resolveFromAddress = () => {
  if (EMAIL_FROM_NAME && (EMAIL_FROM || EMAIL_USER)) {
    return `${EMAIL_FROM_NAME} <${EMAIL_FROM || EMAIL_USER}>`;
  }

  return EMAIL_FROM || EMAIL_USER || undefined;
};

const sendNotificationEmail = async (to, subject, htmlContent) => {
  if (!transporter) {
    console.error('sendNotificationEmail skipped: transporter not configured.');
    return;
  }

  if (!to || !subject || !htmlContent) {
    console.error('sendNotificationEmail skipped: missing required parameters.', {
      hasRecipient: Boolean(to),
      hasSubject: Boolean(subject),
      hasContent: Boolean(htmlContent),
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: resolveFromAddress(),
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
};

module.exports = {
  sendNotificationEmail,
};
