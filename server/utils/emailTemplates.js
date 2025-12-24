const { formatDateBlock, formatCurrency } = require('./eventHelpers');

const STATUS_BADGE_COLORS = {
  approved: '#16a34a',
  rejected: '#dc2626',
};
const MAGAZINE_DEEP_GREEN = '#1a3c34';
const MAGAZINE_MINT = '#5ff5c4';
const MAGAZINE_CANVAS = '#f5f9f7';
const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1529158062015-cad636e69505?auto=format&fit=crop&w=1200&q=80';
const FALLBACK_RECEIPT_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80';

const buildStatusChangeEmailHtml = ({ organizerName, eventTitle, status, remarks }) => {
  const badgeColor = STATUS_BADGE_COLORS[status] || '#334155';
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #e2e8f0; border-radius: 16px;">
      <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #f8fafc;">Event Status Update</h1>
      <p style="margin: 0 0 12px;">Hello ${organizerName || 'Organizer'},</p>
      <p style="margin: 0 0 20px;">Your event <strong>${eventTitle}</strong> has been updated.</p>
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: ${badgeColor}; color: #fff; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${statusLabel}</span>
      </div>
      ${remarks ? `<p style="margin: 0 0 20px;">${remarks}</p>` : ''}
      <p style="margin: 0 0 16px;">Need assistance or have questions? Reply directly to this email and our team will help you out.</p>
      <p style="margin: 0; color: #94a3b8;">— The Nexus Events Team</p>
    </div>
  `;
};

const buildMagazineSection = ({ title, body }) => `
  <table width="100%" role="presentation" style="background-color: #ffffff; border-radius: 28px; padding: 24px 28px; margin-bottom: 16px;">
    <tr>
      <td>
        <p style="margin: 0 0 12px; font-family: 'Playfair Display','Georgia',serif; font-size: 18px; letter-spacing: 0.12em; text-transform: uppercase; color: ${MAGAZINE_DEEP_GREEN};">
          ${title}
        </p>
        <div style="font-family: 'Inter','Helvetica Neue',sans-serif; font-size: 14px; line-height: 1.7; color: #334155;">
          ${body}
        </div>
      </td>
    </tr>
  </table>
`;

const buildMagazineCTA = ({ label, url }) => `
  <table role="presentation" cellspacing="0" cellpadding="0" align="left" style="margin: 24px 0;">
    <tr>
      <td style="border-radius: 9999px; background: ${MAGAZINE_MINT}; padding: 12px 26px;">
        <a href="${url}" style="font-family: 'Inter','Helvetica Neue',sans-serif; font-size: 14px; color: ${MAGAZINE_DEEP_GREEN}; text-decoration: none; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;">
          ${label}
        </a>
      </td>
    </tr>
  </table>
`;

const buildMagazineShell = ({
  heroTitle,
  heroSubtitle,
  heroImage,
  kicker,
  sections,
  cta,
  footerNote,
}) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <title>${heroTitle}</title>
    </head>
    <body style="margin:0; padding:0; background:${MAGAZINE_CANVAS};">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background:${MAGAZINE_CANVAS}; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="640" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background:#ffffff; border-radius:32px; overflow:hidden;">
              <tr>
                <td style="background:${MAGAZINE_DEEP_GREEN}; padding: 32px;">
                  <table width="100%" role="presentation">
                    <tr>
                      <td style="font-family:'Playfair Display','Georgia',serif; font-size:28px; font-weight:600; letter-spacing:0.16em; color:#ffffff; text-transform:uppercase;">
                        NEXUS
                      </td>
                      <td align="right" style="font-family:'Inter','Helvetica Neue',sans-serif; font-size:12px; letter-spacing:0.3em; color:#ffffff; text-transform:uppercase;">
                        ${kicker}
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin:28px 0 12px; font-family:'Playfair Display','Georgia',serif; font-size:30px; line-height:1.2; color:#ffffff;">
                    ${heroTitle}
                  </h1>
                  <p style="margin:0; font-family:'Inter','Helvetica Neue',sans-serif; font-size:15px; line-height:1.7; color:#e2f5f0;">
                    ${heroSubtitle}
                  </p>
                </td>
              </tr>
              ${
                heroImage
                  ? `<tr>
                      <td>
                        <img src="${heroImage}" alt="" width="640" style="display:block; width:100%; height:auto;" />
                      </td>
                    </tr>`
                  : ''
              }
              <tr>
                <td style="padding: 32px;">
                  ${sections.join('')}
                  ${cta ? buildMagazineCTA(cta) : ''}
                  <table width="100%" role="presentation" style="margin-top:32px;">
                    <tr>
                      <td style="font-family:'Inter','Helvetica Neue',sans-serif; font-size:12px; color:#475569; text-align:center;">
                        ${footerNote}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background:${MAGAZINE_DEEP_GREEN}; padding: 24px;">
                  <table width="100%" role="presentation">
                    <tr>
                      <td style="font-family:'Inter','Helvetica Neue',sans-serif; font-size:12px; letter-spacing:0.3em; text-transform:uppercase; color:${MAGAZINE_MINT};">
                        NEXUS
                      </td>
                      <td align="right" style="font-family:'Inter','Helvetica Neue',sans-serif; font-size:12px; color:#d1fae5;">
                        Sent via Nexus Event Management • Kano, Nigeria
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const buildEventUpdateEmailHtml = ({ recipientName, event, eventUrl }) => {
  const { formattedDate, niceTime } = formatDateBlock(event);
  const heroImage = event.imageUrl || 'https://via.placeholder.com/600x300';
  const safeEventUrl = eventUrl || '#';
  const greetingName = recipientName || 'there';
  const description =
    event.description || 'We have important updates to share about this experience.';
  const essentialsDate = formattedDate || 'Date to be confirmed';
  const essentialsTime = niceTime || 'Time to be announced';
  const essentialsLocation = event.location || 'Location to be announced';
  const emailTitle = event.title || 'Event update';

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <title>${emailTitle}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#F3F0E9;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color:#F3F0E9; width:100%;">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="max-width:600px; background-color:#FFFFFF; border-radius:16px; overflow:hidden;">
              <tr>
                <td style="background-color:#0F3D3E; padding:24px 28px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                    <tr>
                      <td style="font-family:Georgia, serif; font-size:20px; letter-spacing:0.35em; font-weight:bold; color:#FFFFFF; text-transform:uppercase;">
                        NEXUS
                      </td>
                      <td align="right" style="font-family:Helvetica, Arial, sans-serif; font-size:12px; letter-spacing:0.28em; color:#C67F43; text-transform:uppercase;">
                        EVENT UPDATE
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <img src="${heroImage}" alt="${emailTitle}" width="600" style="display:block; width:100%; max-width:600px; height:auto; border:0; border-bottom-left-radius:16px; border-bottom-right-radius:16px;" />
                </td>
              </tr>
              <tr>
                <td style="padding:28px 28px 16px; font-family:Helvetica, Arial, sans-serif; color:#1A2E28;">
                  <h1 style="margin:0 0 12px; font-family:Georgia, serif; font-size:24px; line-height:1.3; color:#1A2E28;">
                    ${emailTitle}
                  </h1>
                  <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#1A2E28;">
                    Hi ${greetingName},
                  </p>
                  <p style="margin:0; font-size:15px; line-height:1.6; color:#1A2E28;">
                    ${description}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 28px 0;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color:#E8E4D9; border-radius:14px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="margin:0 0 12px; font-family:Georgia, serif; font-size:18px; font-weight:600; color:#1A2E28;">
                          Event Essentials
                        </p>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                          <tr>
                            <td valign="top" style="width:32px; font-size:18px; line-height:1.6;">📅</td>
                            <td style="padding-left:12px; font-family:Helvetica, Arial, sans-serif; font-size:14px; line-height:1.5; color:#1A2E28;">
                              <strong style="display:block; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#1A2E28; margin-bottom:4px;">Date</strong>
                              ${essentialsDate}
                            </td>
                          </tr>
                          <tr>
                            <td height="12" colspan="2"></td>
                          </tr>
                          <tr>
                            <td valign="top" style="width:32px; font-size:18px; line-height:1.6;">⏰</td>
                            <td style="padding-left:12px; font-family:Helvetica, Arial, sans-serif; font-size:14px; line-height:1.5; color:#1A2E28;">
                              <strong style="display:block; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#1A2E28; margin-bottom:4px;">Time</strong>
                              ${essentialsTime}
                            </td>
                          </tr>
                          <tr>
                            <td height="12" colspan="2"></td>
                          </tr>
                          <tr>
                            <td valign="top" style="width:32px; font-size:18px; line-height:1.6;">📍</td>
                            <td style="padding-left:12px; font-family:Helvetica, Arial, sans-serif; font-size:14px; line-height:1.5; color:#1A2E28;">
                              <strong style="display:block; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#1A2E28; margin-bottom:4px;">Location</strong>
                              ${essentialsLocation}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:28px;">
                  <a href="${safeEventUrl}" style="display:inline-block; padding:14px 28px; font-family:Helvetica, Arial, sans-serif; font-size:13px; font-weight:bold; letter-spacing:0.12em; text-transform:uppercase; text-decoration:none; background-color:#C67F43; color:#FFFFFF; border-radius:999px;">
                    View event details
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 36px;">
                  <p style="margin:0; font-family:Helvetica, Arial, sans-serif; font-size:13px; line-height:1.6; color:#1A2E28;">
                    If you have questions, reply directly to this email and we’ll assist you shortly.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:24px 16px; font-family:Helvetica, Arial, sans-serif; font-size:12px; line-height:1.6; color:#1A2E28; opacity:0.7;">
                  Sent via Nexus • Kano, Nigeria
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

const buildEventCancellationEmailHtml = ({ recipientName, event, eventUrl }) => {
  const heroTitle = `“${event.title}” has been cancelled`;
  const heroSubtitle = `A quick word from the team about next steps, refunds, and staying in touch.`;
  const kicker = `${new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })} • Cancellation Notice`;
  const { combined } = formatDateBlock(event);

  const sections = [
    buildMagazineSection({
      title: 'Notes from the organizer',
      body: `
        <p style="margin:0 0 14px;">Hi ${recipientName || 'there'},</p>
        <p style="margin:0 0 14px;">
          We’re sorry to share that <strong>${event.title}</strong> will no longer take place on
          ${combined || 'the previously scheduled date'} at ${event.location || 'the planned venue'}.
        </p>
        <p style="margin:0;">
          We value your enthusiasm and wanted you to hear it directly from us first. Details on refunds
          and future announcements are below.
        </p>
      `,
    }),
    buildMagazineSection({
      title: 'Refund & follow-up',
      body: `
        <p style="margin:0 0 10px;">
          • Refunds will be processed automatically to your original payment method (if applicable).<br/>
          • Expect a confirmation email within the next 3–5 business days.<br/>
          • Keep an eye on your inbox for new dates or replacement experiences.
        </p>
      `,
    }),
    buildMagazineSection({
      title: 'Stay inspired',
      body: `
        <p style="margin:0;">
          Though this chapter closes, our calendar is still full of curated experiences. Browse the latest
          lineup and bookmark the ones that move you.
        </p>
      `,
    }),
  ];

  return buildMagazineShell({
    heroTitle,
    heroSubtitle,
    heroImage: event.imageUrl || FALLBACK_HERO,
    kicker,
    sections,
    cta: {
      label: 'Explore other events',
      url: eventUrl,
    },
    footerNote:
      'This cancellation alert was sent to confirmed guests. Reach us at support@nexus.com if you have questions about your ticket.',
  });
};

const buildPaymentReceiptEmailHtml = ({
  recipientName,
  event = {},
  ticketId,
  amount,
  currency,
  eventUrl,
}) => {
  const eventTitle = event.title || 'Event Ticket';
  const imageSrc = event.imageUrl || FALLBACK_RECEIPT_IMAGE;
  const formattedAmount = formatCurrency(amount, currency || 'NGN');
  const { formattedDate, combined } = formatDateBlock(event);
  const eventDateDisplay = combined || formattedDate || 'Date to be announced';
  const ticketLabel = ticketId || 'Pending assignment';
  const safeEventUrl = eventUrl || '#';
  const greetingName = recipientName || 'there';

  const purchaseDate = new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <title>${eventTitle} • Receipt</title>
    </head>
    <body style="margin:0; padding:0; background-color:#F3F0E9;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color:#F3F0E9; width:100%;">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="max-width:600px; background-color:#FFFFFF; border-radius:16px; overflow:hidden;">
              <tr>
                <td style="background-color:#0F3D3E; padding:24px 28px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                    <tr>
                      <td style="font-family:Georgia, serif; font-size:20px; letter-spacing:0.35em; font-weight:bold; color:#FFFFFF; text-transform:uppercase;">
                        NEXUS
                      </td>
                      <td align="right" style="font-family:Helvetica, Arial, sans-serif; font-size:12px; letter-spacing:0.28em; color:#C67F43; text-transform:uppercase;">
                        RECEIPT
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <img src="${imageSrc}" alt="${eventTitle}" width="600" style="display:block; width:100%; max-width:600px; height:auto; border:0;" />
                </td>
              </tr>
              <tr>
                <td style="padding:28px 28px 16px; font-family:Helvetica, Arial, sans-serif; color:#1A2E28;">
                  <h1 style="margin:0 0 12px; font-family:Georgia, serif; font-size:24px; line-height:1.3; color:#1A2E28;">
                    Payment receipt for ${eventTitle}
                  </h1>
                  <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#1A2E28;">
                    Hi ${greetingName},
                  </p>
                  <p style="margin:0; font-size:15px; line-height:1.6; color:#1A2E28;">
                    Thanks for reserving your seat. Your payment is confirmed and your ticket is ready.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 28px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color:#E8E4D9; border-radius:14px;">
                    <tr>
                      <td style="padding:20px 24px; font-family:Helvetica, Arial, sans-serif; color:#1A2E28;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="font-size:14px; line-height:1.5;">
                          <tr>
                            <td style="font-family:Georgia, serif; font-size:16px; font-weight:600; color:#1A2E28;">Amount</td>
                            <td align="right" style="font-weight:600; color:#1A2E28;">${formattedAmount}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="height:14px;"></td>
                          </tr>
                          <tr>
                            <td style="font-family:Georgia, serif; font-size:16px; font-weight:600; color:#1A2E28;">Ticket ID</td>
                            <td align="right" style="font-weight:600; color:#1A2E28;">${ticketLabel}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="height:14px;"></td>
                          </tr>
                          <tr>
                            <td style="font-family:Georgia, serif; font-size:16px; font-weight:600; color:#1A2E28;">Event Date</td>
                            <td align="right" style="color:#1A2E28;">${eventDateDisplay}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="height:14px;"></td>
                          </tr>
                          <tr>
                            <td style="font-family:Georgia, serif; font-size:16px; font-weight:600; color:#1A2E28;">Issued</td>
                            <td align="right" style="color:#1A2E28;">${purchaseDate}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:0 28px 28px;">
                  <a href="${safeEventUrl}" style="display:inline-block; padding:14px 28px; font-family:Helvetica, Arial, sans-serif; font-size:13px; font-weight:bold; letter-spacing:0.12em; text-transform:uppercase; text-decoration:none; background-color:#C67F43; color:#FFFFFF; border-radius:999px;">
                    View ticket details
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 36px; font-family:Helvetica, Arial, sans-serif; font-size:13px; line-height:1.6; color:#1A2E28;">
                  Keep this message handy for check-in. If you need assistance, reply directly and our team will help.
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:24px 16px; font-family:Helvetica, Arial, sans-serif; font-size:12px; line-height:1.6; color:#1A2E28; opacity:0.7;">
                  Sent via Nexus • Kano, Nigeria
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

module.exports = {
  buildStatusChangeEmailHtml,
  buildEventUpdateEmailHtml,
  buildEventCancellationEmailHtml,
  buildPaymentReceiptEmailHtml,
};
