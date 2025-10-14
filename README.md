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
- Resend API key for email service

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
   - Add your Resend API key for email service

5. Set up the database:
   - Run the SQL scripts in the `scripts` folder in your Supabase SQL editor
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
- `RESEND_API_KEY` - Your Resend API key

### Storage Configuration
- `BLOB_READ_WRITE_TOKEN` - Your blob storage token

### Application Settings
- `NEXT_PUBLIC_SITE_URL` - Your site URL (http://localhost:3000 for local)

## Database Scripts

### Setup Database
Run the SQL scripts in the `scripts` folder to create all necessary tables, indexes, and functions.

## Deployment

### General Deployment Steps
1. Connect your GitHub repository to your hosting platform
2. Set all environment variables from your `.env` file
3. The platform will automatically detect and deploy your Next.js application
4. Make sure to set `NODE_ENV=production` in environment variables

### Environment Variables for Production
Make sure to set these environment variables in your deployment platform:
- All variables from your `.env` file
- `NODE_ENV=production`
- `NEXT_PHASE=phase-production-build` (for build-time optimization)

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify Supabase credentials in environment variables
- Check that your Supabase project is active
- Ensure database tables are created using the setup scripts

#### Email Not Sending
- Verify Resend API key is correct
- Check that your domain is verified in Resend dashboard
- Review email sending logs for errors

#### File Upload Issues
- Check blob storage configuration
- Verify file size limits (10MB max)
- Ensure proper permissions on storage

#### Application Scoring Issues
- Verify all required criteria are configured
- Check that scoring weights are properly set
- Review application logs for scoring errors

## Architecture

### Backend
- **Next.js 14** with App Router
- **Supabase** for database and authentication
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
- **resend** - Email service

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
This project is proprietary software. All rights reserved.
