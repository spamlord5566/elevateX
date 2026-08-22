const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@elevatex.in';
const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
const smtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

const getParticipantEmails = (registration) => {
  const emails = [registration.leaderEmail, ...(registration.members || []).map((member) => member.email)];
  return [...new Set(emails.filter(Boolean))];
};

const buildAttachment = (registration) => {
  const screenshot = registration.paymentScreenshot;
  const filePath = screenshot && screenshot.path ? screenshot.path : null;
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  return {
    filename: screenshot.originalName || path.basename(filePath),
    path: filePath,
    contentType: screenshot.mimeType || 'application/octet-stream',
  };
};

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  if (!transporter) {
    console.log('[Email Stub] Would send mail:', { to, subject, text });
    return true;
  }

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: to.join(', '),
    subject,
    text,
    html,
    attachments,
  });

  return true;
};

const sendVerificationEmail = async (registration) => {
  const recipients = getParticipantEmails(registration);
  if (recipients.length === 0) {
    return false;
  }

  const subject = `Verification Successful — ${registration.teamName}`;
  const text = [
    `Team: ${registration.teamName}`,
    `Registration ID: ${registration.teamId}`,
    `Participant count: ${registration.participantCount}`,
    `Amount paid: ₹${registration.totalRegistrationFee}`,
    'Your payment has been verified and your registration is confirmed.',
  ].join('\n');

  await sendEmail({
    to: recipients,
    subject,
    text,
    html: `<p>Congratulations! Your team registration for <strong>${registration.teamName}</strong> has been verified.</p><p>Registration ID: <strong>${registration.teamId}</strong></p><p>Amount: <strong>₹${registration.totalRegistrationFee}</strong></p>`,
  });

  return true;
};

const sendRejectionEmail = async (registration) => {
  const recipients = getParticipantEmails(registration);
  if (recipients.length === 0) {
    return false;
  }

  const subject = `Registration Update — ${registration.teamName}`;
  const attachment = buildAttachment(registration);

  const text = [
    `Team: ${registration.teamName}`,
    `Registration ID: ${registration.teamId}`,
    `Expected amount: ₹${registration.totalRegistrationFee}`,
    `Rejection reason: ${registration.rejectionReason || 'Not provided'}`,
    'The payment screenshot you uploaded is attached for reference.',
  ].join('\n');

  await sendEmail({
    to: recipients,
    subject,
    text,
    html: `<p>Your registration for <strong>${registration.teamName}</strong> was rejected.</p><p>Reason: <strong>${registration.rejectionReason || 'Not provided'}</strong></p><p>Expected amount: <strong>₹${registration.totalRegistrationFee}</strong></p>`,
    attachments: attachment ? [attachment] : undefined,
  });

  return true;
};

module.exports = {
  sendVerificationEmail,
  sendRejectionEmail,
};
