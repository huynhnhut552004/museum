const { Resend } = require('resend');

const EMAIL_API_TIMEOUT_MS = 10000;

const transporter = {
  sendMail: async ({ to, subject, html }) => {
    try {
      if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');
      const from = process.env.EMAIL_FROM ||
        (process.env.RESEND_TEST_MODE === 'true' ? 'onboarding@resend.dev' : null);
      if (!from) throw new Error('EMAIL_FROM is not configured');

      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html
      }, {
        signal: AbortSignal.timeout(EMAIL_API_TIMEOUT_MS)
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Email API delivery failed:', {
        name: error.name,
        statusCode: error.statusCode,
        message: error.message
      });
      throw error;
    }
  }
};

module.exports = transporter;
