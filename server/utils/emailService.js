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

/**
 * Resolves the "From" address for the email.
 *
 * @returns {string|undefined} The formatted "From" address or undefined if not configured.
 */
const resolveFromAddress = () => {
  if (EMAIL_FROM_NAME && (EMAIL_FROM || EMAIL_USER)) {
    return `${EMAIL_FROM_NAME} <${EMAIL_FROM || EMAIL_USER}>`;
  }

  return EMAIL_FROM || EMAIL_USER || undefined;
};

/**
 * Sends a notification email to a specified recipient.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} htmlContent - The HTML content of the email body.
 * @returns {Promise<void>} Resolves when the email is sent (or skipped/failed silently with logging).
 */
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
