import nodemailer from 'nodemailer';

// Create Nodemailer Transporter using Gmail SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER || 'hiteshvaishnav602@gmail.com',
    pass: process.env.EMAIL_PASS || 'zteoqcdxcwhocwhd'
  }
});

// Verify SMTP Connection on Startup
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ SMTP Transporter connection warning:', error.message);
  } else {
    console.log('✉️ Gmail SMTP Transporter ready to send emails.');
  }
});

export const sendWelcomeEmail = async ({ email, name }) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; background: #FFFFFF;">
        <div style="background: #2563EB; color: #FFFFFF; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to Autohire.ai! 🚀</h1>
        </div>
        <div style="padding: 24px; color: #0F172A; line-height: 1.6;">
          <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
          <p>Thank you for logging in with Google on <strong>Autohire.ai</strong> — your AI-powered career assistant!</p>
          <p>Here is what you can do right away:</p>
          <ul>
            <li><strong>Upload your Resume:</strong> Get AI extracted skills & high profile scores.</li>
            <li><strong>Explore Job Matches:</strong> View top matched software engineering jobs.</li>
            <li><strong>Generate Cover Letters:</strong> Create tailored cover letters in seconds.</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/dashboard" style="background: #2563EB; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard →</a>
          </div>
          <p style="font-size: 13px; color: #64748B;">Happy Job Hunting,<br/>The Autohire.ai Team</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Autohire.ai Team" <${process.env.EMAIL_FROM || 'hiteshvaishnav602@gmail.com'}>`,
      to: email,
      subject: 'Welcome to Autohire.ai — Your AI Career Assistant!',
      html: htmlContent
    });

    console.log(`✉️ Welcome email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('❌ Failed to send welcome email:', err.message);
  }
};

export const sendApplicationConfirmationEmail = async ({ email, name, jobTitle, company, matchScore }) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; background: #FFFFFF;">
        <div style="background: #16A34A; color: #FFFFFF; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">⚡ Application Submitted via Autohire.ai!</h1>
        </div>
        <div style="padding: 24px; color: #0F172A; line-height: 1.6;">
          <p style="font-size: 16px;">Hi <strong>${name || 'Candidate'}</strong>,</p>
          <p>Your job application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been logged successfully!</p>
          
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 4px 0;">🎯 <strong>Role:</strong> ${jobTitle}</p>
            <p style="margin: 4px 0;">🏢 <strong>Company:</strong> ${company}</p>
            <p style="margin: 4px 0;">📊 <strong>AI Match Score:</strong> <span style="color: #16A34A; font-weight: bold;">${matchScore}%</span></p>
            <p style="margin: 4px 0;">📅 <strong>Applied Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p style="font-size: 14px; color: #64748B;">You can track your application status anytime from your Autohire Dashboard.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="http://localhost:5173/applications" style="background: #16A34A; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">View Applications Pipeline →</a>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Autohire.ai Applications" <${process.env.EMAIL_FROM || 'hiteshvaishnav602@gmail.com'}>`,
      to: email,
      subject: `Application Receipt: ${jobTitle} at ${company} (${matchScore}% AI Match)`,
      html: htmlContent
    });

    console.log(`✉️ Application confirmation email sent to ${email}`);
    return info;
  } catch (err) {
    console.error('❌ Failed to send application email:', err.message);
  }
};

export const sendNotificationEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Autohire.ai Alerts" <${process.env.EMAIL_FROM || 'hiteshvaishnav602@gmail.com'}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    });
    return info;
  } catch (err) {
    console.error('❌ Failed to send notification email:', err.message);
  }
};

export default transporter;
