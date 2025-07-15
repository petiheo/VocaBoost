const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    (async () => {
      try {
        await this.transporter.verify();
        console.log('Configure SMTP successfully');
      } catch (err) {
        console.error('Configure SMTP failed: ', err);
      }
    })();
  }

  async sendEmailVerification(to, verificationToken) {
    try {
      await this.transporter.sendMail({
        from: `"VocaBoost" <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'Welcome to VocaBoost - Verify account',
        html: `<a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}"> Verify Email </a>`,
        text: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
      });
      console.log('Send verification email successfully!');
    } catch (error) {
      throw error;
    }
  }

  async sendClassInvitation(to, token, classInfo) {
    try {
      const inviteUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${token}`;
      const html = `
        <p>You've been invited to join the class <strong>${classInfo.name}</strong>.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteUrl}">Join Class</a>
        <p>This link will expire in 7 days.</p>
      `;

      await this.transporter.sendMail({
        from: `"VocaBoost" <${process.env.FROM_EMAIL}>`,
        to,
        subject: `Invitation to join class "${classInfo.name}"`,
        html,
        text: `Join class here: ${inviteUrl}`,
      });

    } catch (error) {
      console.error(`Failed to send invitation to ${to}:`, error);
      throw error;
    }
  }
}

module.exports = new EmailService();
