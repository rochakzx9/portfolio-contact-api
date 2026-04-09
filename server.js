import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables with error handling
try {
  dotenv.config();
  console.log('Environment variables loaded successfully');
  console.log('ELASTIC_EMAIL_USER:', process.env.ELASTIC_EMAIL_USER ? 'SET' : 'NOT SET');
  console.log('ELASTIC_EMAIL_PASSWORD:', process.env.ELASTIC_EMAIL_PASSWORD ? 'SET' : 'NOT SET');
  console.log('OWNER_EMAIL:', process.env.OWNER_EMAIL ? 'SET' : 'NOT SET');
} catch (error) {
  console.error('Error loading environment variables:', error);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' })); // ✅ Allow all domains
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Create ElasticEmail transporter for reliable cloud deployment
const transporter = nodemailer.createTransport({
  host: 'smtp.elasticemail.com',
  port: 2525,
  secure: false, // Use TLS
  auth: {
    user: process.env.ELASTIC_EMAIL_USER,
    pass: process.env.ELASTIC_EMAIL_PASSWORD,
  },
  pool: true, // Use connection pooling
  maxConnections: 1,
  rateDelta: 15000,
  rateLimit: 5,
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
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
    console.log('Request received:', req.body);
    const { from_name, from_email, subject, message } = req.body;

    // Validate required fields
    if (!from_name || !from_email || !subject || !message) {
      console.log('Validation error: missing fields');
      return res.status(400).json({
        success: false,
        error: 'All fields are required: from_name, from_email, subject, message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(from_email)) {
      console.log('Validation error: invalid email format');
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check environment variables
    if (!process.env.ELASTIC_EMAIL_USER || !process.env.ELASTIC_EMAIL_PASSWORD || !process.env.OWNER_EMAIL) {
      console.log('Environment variables missing:', {
        ELASTIC_EMAIL_USER: !!process.env.ELASTIC_EMAIL_USER,
        ELASTIC_EMAIL_PASSWORD: !!process.env.ELASTIC_EMAIL_PASSWORD,
        OWNER_EMAIL: !!process.env.OWNER_EMAIL
      });
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: missing environment variables'
      });
    }

    const ownerMailOptions = {
      from: process.env.ELASTIC_EMAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject: `New Contact Form Message: ${subject}`,
      text: getOwnerEmailTemplate({ from_name, from_email, subject, message }),
    };

    const userMailOptions = {
      from: process.env.ELASTIC_EMAIL_USER,
      to: from_email,
      subject: 'Thank you for contacting me',
      text: getUserEmailTemplate({ from_name, subject }),
    };

    // Send both emails using Gmail
    console.log('Sending emails...');
    try {
      const [ownerResult, userResult] = await Promise.all([
        transporter.sendMail(ownerMailOptions),
        transporter.sendMail(userMailOptions)
      ]);
      
      console.log('Owner email sent:', ownerResult.messageId);
      console.log('User email sent:', userResult.messageId);

      res.json({ success: true });
    } catch (error) {
      console.error('Error sending emails:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to send emails. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Error sending emails:', error);
    console.error('Error details:', {
      code: error.code,
      response: error.response,
      message: error.message
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to send emails. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Portfolio Contact API is running'
  });
});

// Debug endpoint to check environment variables
app.get('/api/debug', (req, res) => {
  res.json({ 
    environment: {
      ELASTIC_EMAIL_USER: process.env.ELASTIC_EMAIL_USER ? 'SET' : 'NOT SET',
      ELASTIC_EMAIL_PASSWORD: process.env.ELASTIC_EMAIL_PASSWORD ? 'SET' : 'NOT SET',
      OWNER_EMAIL: process.env.OWNER_EMAIL ? 'SET' : 'NOT SET',
      PORT: process.env.PORT || '3000'
    },
    timestamp: new Date().toISOString()
  });
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