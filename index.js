require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// GET API for sending Hello World
app.get('/', (req, res) => {
  res.send('Hello World');
});

// POST API for sending the mail
app.post('/api/contact', async (req, res) => {
  try {
    console.log("Received contact form submission via Nodemailer");
    const { name, email, phone, score } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name, email are required." });
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || 'Australia PR Calculator <no-reply@example.com>',
      to: 'hr@geminieducation.com.au',
      replyTo: email,
      subject: `New PR Enquiry from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%); padding: 32px 28px;">
            <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">
              New Migration Enquiry
            </h1>
            <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px;">
              Submitted via Australia PR Points Calculator
            </p>
          </div>

          <!-- Score badge -->
          ${score !== undefined
          ? `
          <div style="padding: 20px 28px 0;">
            <div style="display: inline-flex; align-items: center; gap: 10px; background: ${score >= 65 ? "#eff6ff" : "#fffbeb"}; border: 1.5px solid ${score >= 65 ? "#bfdbfe" : "#fde68a"}; border-radius: 12px; padding: 12px 18px;">
              <span style="font-size: 28px; font-weight: 800; color: ${score >= 65 ? "#1d4ed8" : "#b45309"}; font-family: monospace;">${score}</span>
              <div>
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: ${score >= 65 ? "#3b82f6" : "#f59e0b"};">Points Score</div>
                <div style="font-size: 12px; color: #64748b;">${score >= 65 ? "✅ Pass mark reached" : `⚠️ ${65 - score} pts below pass mark`}</div>
              </div>
            </div>
          </div>`
          : ""
        }

          <!-- Contact details -->
          <div style="padding: 24px 28px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; width: 120px;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8;">Name</span>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                  <span style="font-size: 14px; color: #0f172a; font-weight: 600;">${name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8;">Email</span>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                  <a href="mailto:${email}" style="font-size: 14px; color: #3b82f6;">${email}</a>
                </td>
              </tr>
              ${phone
              ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8;">Phone</span>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <a href="tel:${phone}" style="font-size: 14px; color: #0f172a;">${phone}</a>
                  </td>
                </tr>`
              : ""
            }
            <tr>
              <td style="padding: 10px 0; vertical-align: top; padding-top: 14px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8;">Message</span>
              </td>
              <td style="padding: 10px 0; vertical-align: top; padding-top: 14px;">
                <span style="font-size: 14px; color: #0f172a;">${req.body.message || "No message provided"}</span>
              </td>
            </tr>
            </table>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 28px; background: #f1f5f9; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
              Sent from Australia PR Points Calculator · geminieducation.com.au
            </p>
          </div>
        </div>
      `,
    });

    return res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Nodemailer error details:", err);
    return res.status(500).json({
      error: "Failed to send message via Nodemailer.",
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});