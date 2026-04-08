# Portfolio Contact API

A Node.js API for handling portfolio contact form submissions with automatic email notifications using Gmail SMTP.

## Features

- Sends notification email to site owner
- Sends auto-reply email to user
- Gmail SMTP with App Password authentication
- CORS enabled for cross-origin requests
- Input validation and error handling
- Health check endpoint

## Setup

### Prerequisites

1. Node.js 18+ installed
2. Gmail account with App Password enabled

### Gmail App Password Setup

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App Passwords
3. Generate a new app password for "Mail" on "Other (Custom name)"
4. Copy the generated password (you won't see it again)

### Local Development

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Fill in your environment variables in `.env`:
   ```
   GMAIL_USER=your-gmail-address@gmail.com
   GMAIL_PASS=your-app-password-here
   OWNER_EMAIL=your-email@example.com
   ```
5. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### POST /api/contact

Submit contact form data.

**Request Body:**
```json
{
  "from_name": "John Doe",
  "from_email": "john@example.com",
  "subject": "Hello from your portfolio",
  "message": "I love your work!"
}
```

**Response:**
```json
{
  "success": true
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "Portfolio Contact API is running"
}
```

## Deployment Guide

### Option 1: Render (Recommended)

1. **Create a GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/portfolio-contact-api.git
   git push -u origin main
   ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Sign up and click "New +" > "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `portfolio-contact-api`
     - Runtime: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Click "Advanced Settings" > "Add Environment Variable"
   - Add your environment variables:
     - `GMAIL_USER`: your Gmail address
     - `GMAIL_PASS`: your app password
     - `OWNER_EMAIL`: your email for notifications
   - Click "Create Web Service"

3. **Test your API**
   - Wait for deployment (Render will provide a URL)
   - Test with curl:
   ```bash
   curl -X POST https://your-app-name.onrender.com/api/contact \
     -H "Content-Type: application/json" \
     -d '{"from_name":"Test User","from_email":"test@example.com","subject":"Test","message":"Test message"}'
   ```

### Option 2: Railway

1. **Create GitHub repository** (same as above)

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up and click "Deploy from GitHub repo"
   - Connect your repository
   - Railway will auto-detect Node.js
   - Add environment variables in the "Variables" tab:
     - `GMAIL_USER`: your Gmail address
     - `GMAIL_PASS`: your app password
     - `OWNER_EMAIL`: your email for notifications
   - Click "Deploy"

3. **Test your API**
   - Railway will provide a URL
   - Test the same way as with Render

### Option 3: Fly.io

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr -useb https://fly.io/install.ps1 | iex
   ```

2. **Create GitHub repository** (same as above)

3. **Deploy to Fly.io**
   ```bash
   fly auth login
   fly launch
   # Follow prompts, accept defaults
   fly secrets set GMAIL_USER=your-gmail@gmail.com
   fly secrets set GMAIL_PASS=your-app-password
   fly secrets set OWNER_EMAIL=your-email@example.com
   fly deploy
   ```

4. **Test your API**
   - Fly.io will provide a URL
   - Test the same way as with Render

## Testing After Deployment

1. **Health Check**
   ```bash
   curl https://your-deployed-url/api/health
   ```

2. **Contact Form Test**
   ```bash
   curl -X POST https://your-deployed-url/api/contact \
     -H "Content-Type: application/json" \
     -d '{"from_name":"Your Name","from_email":"your-email@example.com","subject":"Test Subject","message":"This is a test message"}'
   ```

3. **Check Emails**
   - Verify you received the notification email
   - Verify the user received the auto-reply

## Integration with Portfolio Website

Add this to your portfolio's contact form JavaScript:

```javascript
async function submitContactForm(formData) {
  try {
    const response = await fetch('https://your-deployed-url/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Message sent successfully!');
    } else {
      alert('Failed to send message: ' + result.error);
    }
  } catch (error) {
    alert('Error sending message: ' + error.message);
  }
}
```

## Security Notes

- Never expose your Gmail password in client-side code
- Use environment variables for all sensitive data
- Consider adding rate limiting for production use
- Validate all input on both client and server side

## License

MIT
