import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' })); // ✅ Allow all domains
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Create Gmail transporter using App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Email templates
const getOwnerEmailTemplate = ({ from_name, from_email, subject, message }) => `
A message by ${from_name} has been received from your website (Portfolio). Kindly respond at your earliest convenience.

Name: ${from_name}
Email: ${from_email}
Subject: ${subject}
Message: ${message}
`.trim();

const getUserEmailTemplate = ({ from_name, subject }) => `
Hi ${from_name},

Thank you for reaching out to me. I have received your request: "${subject}", and I will review it as soon as possible.

Best regards,
Rochak Raj Sharma
`.trim();

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { from_name, from_email, subject, message } = req.body;

    if (!from_name || !from_email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required: from_name, from_email, subject, message' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(from_email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const ownerMailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject: `New Contact Form Message: ${subject}`,
      text: getOwnerEmailTemplate({ from_name, from_email, subject, message }),
    };

    const userMailOptions = {
      from: process.env.GMAIL_USER,
      to: from_email,
      subject: 'Thank you for contacting me',
      text: getUserEmailTemplate({ from_name, subject }),
    };

    console.log('Sending emails...');
    const [ownerResult, userResult] = await Promise.all([
      transporter.sendMail(ownerMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    console.log('Owner email sent:', ownerResult.messageId);
    console.log('User email sent:', userResult.messageId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ success: false, error: 'Failed to send emails. Please try again later.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), message: 'Portfolio Contact API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Contact API',
    endpoints: {
      contact: 'POST /api/contact',
      health: 'GET /api/health'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio Contact API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Contact endpoint: http://localhost:${PORT}/api/contact`);
});