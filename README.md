# HireRankerAI - AI-Powered Hiring Platform

## Overview
HireRankerAI is a comprehensive hiring management system that uses AI to rank and score job applicants automatically. The platform includes resume parsing, duplicate detection, video interviews, and intelligent candidate scoring.

## Features
- **AI-Powered Resume Parsing**: Automatically extract candidate information from resumes
- **Intelligent Scoring System**: Score candidates based on customizable criteria
- **Duplicate Detection**: Prevent duplicate applications with smart matching
- **Video Interview Integration**: Built-in video calling capabilities
- **Real-time Dashboard**: Track applications and manage hiring pipelines
- **File Management**: Secure file upload and storage for resumes and documents

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- SMTP email service (Gmail recommended)

### Installation
1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd hireranker-ai
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Configure your environment variables in `.env`:
   - Get your Supabase URL and keys from your Supabase project dashboard
   - Add your email credentials for SMTP (Gmail app password recommended)

5. Set up the database:
   - Run `scripts/setup_database.sql` in your Supabase SQL editor
   - This creates all necessary tables and functions

6. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Required Environment Variables

### Database Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Email Configuration
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` - Your Gmail app password

### Application Settings
- `NEXT_PUBLIC_SITE_URL` - Your site URL (http://localhost:3000 for local)

## Database Scripts

### Setup Database
Run `scripts/setup_database.sql` to create all necessary tables, indexes, and functions.

### Reset Database
Run `scripts/reset_database.sql` to clear all data while preserving table structure (useful for fresh deployments).

## Deployment

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard using the values from your `.env` file
3. Railway will automatically detect and deploy your Next.js application
4. Make sure to set `NODE_ENV=production` in Railway environment variables

### Render Deployment
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables in Render dashboard using the values from your `.env` file
4. Use the following build and start commands:
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Make sure to set `NODE_ENV=production` in Render environment variables

### Environment Variables for Production
For Railway and Render, make sure to set these environment variables in your deployment platform:
- All variables from your `.env` file
- `NODE_ENV=production`
- `PORT=3000` (or let the platform set it automatically)

See `DEPLOYMENT.md` for comprehensive deployment instructions for various hosting platforms.

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify Supabase credentials in environment variables
- Check that your Supabase project is active
- Ensure database tables are created using the setup script

#### Email Not Sending
- Verify Gmail app password is correct
- Check SMTP settings
- Ensure 2FA is enabled on Gmail account

#### File Upload Issues
- Check Supabase Storage bucket configuration
- Verify file size limits (10MB max)
- Ensure proper permissions on storage bucket

#### Application Scoring Issues
- Verify all required criteria are configured
- Check that scoring weights are properly set
- Review application logs for scoring errors

## Architecture

### Backend
- **Next.js 14** with App Router
- **Supabase** for database and authentication
- **Node.js** server with WebSocket support
- **TypeScript** for type safety

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **Radix UI** components
- **Lucide React** icons

### Key Libraries
- **@supabase/supabase-js** - Database client
- **react-hook-form** - Form management
- **zod** - Schema validation
- **recharts** - Data visualization
- **nodemailer** - Email sending

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
This project is proprietary software. All rights reserved.
