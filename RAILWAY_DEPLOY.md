# Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI**: Install the Railway CLI
3. **Git Repository**: Your code should be committed to Git

## Step 1: Install Railway CLI

```bash
# Using npm (recommended)
npm install -g @railway/cli

# Or using PowerShell (Windows)
iwr https://railway.app/install.ps1 | iex
```

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate with Railway.

## Step 3: Initialize Railway Project

In your project directory:

```bash
# Initialize Railway project
railway init

# Select "Deploy from GitHub repo" if you want to connect to GitHub
# Or "Deploy from current directory" to deploy directly
```

## Step 4: Set Environment Variables

Add your production environment variables to Railway:

```bash
# Database
railway variables set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/school-payments"

# JWT Configuration
railway variables set JWT_SECRET="your-super-secure-production-jwt-secret-at-least-32-chars-long"
railway variables set JWT_EXPIRES_IN="24h"

# Payment Gateway Configuration
railway variables set PG_KEY="edvtest01"
railway variables set API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
railway variables set SCHOOL_ID="65b0e6293e9f76a9694d84b4"
railway variables set PAYMENT_API_URL="https://api.paymentgateway.com"

# Server Configuration
railway variables set PORT="3000"
railway variables set NODE_ENV="production"
```

**Alternative: Set via Railway Dashboard**
1. Go to your project dashboard on railway.app
2. Click "Variables" tab
3. Add each environment variable manually

## Step 5: Deploy

```bash
# Deploy your application
railway up
```

Railway will:
- Detect it's a Node.js project
- Install dependencies with `npm ci`
- Build your project with `npm run build`
- Start your application with `npm run start:prod`

## Step 6: Get Your App URL

```bash
# Get the deployment URL
railway status
```

Or check the Railway dashboard for your app's public URL.

## Step 7: Configure Custom Domain (Optional)

1. Go to Railway dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as shown
4. Enable SSL certificate

## Testing Your Deployment

Test your deployed API endpoints:

```bash
# Replace YOUR_RAILWAY_URL with your actual Railway app URL
curl https://YOUR_RAILWAY_URL.up.railway.app/

# Test authentication endpoint
curl -X POST https://YOUR_RAILWAY_URL.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `super-secret-key-change-me` |
| `JWT_EXPIRES_IN` | Token expiration time | `24h` |
| `PG_KEY` | Payment gateway key | `edvtest01` |
| `API_KEY` | Payment gateway API key | `eyJhbGci...` |
| `SCHOOL_ID` | School identifier | `65b0e6293e9f76a9694d84b4` |
| `PAYMENT_API_URL` | Payment gateway API URL | `https://api.paymentgateway.com` |
| `PORT` | Server port (Railway auto-assigns) | `3000` |
| `NODE_ENV` | Environment | `production` |

## Monitoring and Logs

```bash
# View application logs
railway logs

# Follow logs in real-time
railway logs --follow
```

## Troubleshooting

### Build Issues
- Check `railway logs` for build errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
- Ensure database user has proper permissions

### Environment Variable Issues
- Double-check all required variables are set
- Use `railway variables` to list current variables
- Ensure no typos in variable names

### Payment Gateway Issues
- Verify API keys are correct
- Check payment gateway webhooks point to your Railway URL
- Ensure HTTPS is enabled (Railway provides this automatically)

## Railway CLI Commands Reference

```bash
# Project management
railway init                 # Initialize new project
railway login                # Login to Railway
railway logout               # Logout

# Deployment
railway up                   # Deploy current directory
railway up --detach          # Deploy without following logs

# Environment variables
railway variables            # List all variables
railway variables set KEY=VALUE  # Set a variable
railway variables unset KEY  # Remove a variable

# Logs and monitoring
railway logs                 # Show recent logs
railway logs --follow        # Follow logs in real-time
railway status              # Show project status

# Local development
railway run npm start        # Run command with Railway env vars
railway shell               # Open shell with env vars loaded
```

## Security Best Practices

1. **JWT Secret**: Use a strong, random secret (32+ characters)
2. **Database**: Use MongoDB Atlas with IP whitelisting
3. **API Keys**: Never commit secrets to Git
4. **HTTPS**: Railway provides HTTPS automatically
5. **Environment Variables**: Use Railway's secure variable storage

## Next Steps

1. Set up monitoring and alerting
2. Configure backup strategies for your MongoDB
3. Set up CI/CD with GitHub integration
4. Add custom domain and SSL certificate
5. Configure webhook endpoints for payment processing

Your school payment backend is now live on Railway! 🚀
