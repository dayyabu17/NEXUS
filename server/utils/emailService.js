const nodemailer = require('nodemailer');

// Reusable transporter configured with environment credentials.
const {
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  EMAIL_FROM_NAME,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_CONNECTION_TIMEOUT,
  EMAIL_SOCKET_TIMEOUT,
} = process.env;

const resolvedPort = Number(EMAIL_PORT) || 587;
const resolvedSecure = resolveSecureFlag(EMAIL_SECURE, resolvedPort);

const transporter = EMAIL_USER && EMAIL_PASS
  ? nodemailer.createTransport({
      host: EMAIL_HOST || 'smtp.gmail.com',
      port: resolvedPort,
      secure: resolvedSecure,
      requireTLS: !resolvedSecure,
      connectionTimeout: Number(EMAIL_CONNECTION_TIMEOUT) || 10000,
      socketTimeout: Number(EMAIL_SOCKET_TIMEOUT) || 20000,
      logger: true,
      debug: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })
  : null;

/**
 * Resolve secure flag from env string or default behaviour.
 * @param {string|undefined} flag
 * @param {number} port
 * @returns {boolean}
 */
function resolveSecureFlag(flag, port) {
  if (typeof flag === 'string') {
    return ['1', 'true', 'yes'].includes(flag.toLowerCase());
  }

  return port === 465;
}

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
