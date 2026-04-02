import nodemailer from 'nodemailer';

// Create a mock transporter that uses ethereal or simply logs to console
// if credentials aren't provided.
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Use Ethereal fake SMTP account for development/testing
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return transporter;
}

export async function sendNotificationEmail(to: string, subject: string, message: string) {
  try {
    const t = await getTransporter();
    
    const info = await t.sendMail({
      from: '"Tracker System" <noreply@tracker.local>',
      to,
      subject,
      text: message,
      html: `<div><p>${message.replace(/\n/g, '<br/>')}</p></div>`,
    });

    console.log(`\n============================`);
    console.log(`📧 MOCK EMAIL SENT`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Preview URL: %s`, nodemailer.getTestMessageUrl(info));
    console.log(`============================\n`);
    
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
