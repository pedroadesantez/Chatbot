# Deployment Guide

This guide covers deploying your AI Chatbot to various platforms.

## Prerequisites

- Git repository with your code
- OpenAI API key
- MongoDB instance (optional)

## Frontend Deployment (Vercel - Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Step 1: Prepare for Deployment

1. Ensure your code is pushed to GitHub, GitLab, or Bitbucket
2. Make sure your `frontend/package.json` has the correct build scripts

### Step 2: Deploy to Vercel

1. Visit [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your repository
4. Set the root directory to `frontend`
5. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

In Vercel dashboard, add:
- `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`

### Step 4: Deploy

Click "Deploy" - Vercel will build and deploy automatically.

## Backend Deployment

### Option 1: Render (Recommended)

1. Visit [render.com](https://render.com) and sign up/login
2. Click "New" → "Web Service"
3. Connect your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18+

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   OPENAI_API_KEY=your_actual_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   FRONTEND_URL=https://your-frontend-url.vercel.app
   MONGODB_URI=your_mongodb_connection_string (optional)
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=20
   ```

6. Click "Create Web Service"

### Option 2: Railway

1. Visit [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will detect your backend automatically

5. Configure Environment Variables (same as above)

### Option 3: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Configure environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set OPENAI_API_KEY=your_key_here
   heroku config:set OPENAI_MODEL=gpt-3.5-turbo
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
   heroku config:set MONGODB_URI=your_connection_string
   ```

6. Deploy:
   ```bash
   git subtree push --prefix=backend heroku main
   ```

## Database Deployment (Optional)

### MongoDB Atlas (Recommended)

1. Visit [mongodb.com](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
5. Get your connection string
6. Update `MONGODB_URI` in your backend environment variables

### Alternative: Railway PostgreSQL

If you prefer PostgreSQL, you can modify the backend to use PostgreSQL instead of MongoDB.

## Custom Domain (Optional)

### Frontend (Vercel)
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Backend (Render/Railway)
1. In your platform dashboard, find domain settings
2. Add your custom domain
3. Update CORS settings in backend to allow your new domain

## Environment Variables Summary

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
OPENAI_API_KEY=your_actual_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatbot
FRONTEND_URL=https://your-frontend-url.vercel.app
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20
SESSION_SECRET=your_secure_session_secret
```

## Production Checklist

- [ ] OpenAI API key is set correctly
- [ ] Frontend URL is configured in backend CORS
- [ ] Backend URL is configured in frontend
- [ ] MongoDB is connected (if using)
- [ ] Rate limiting is configured appropriately
- [ ] HTTPS is enabled on both frontend and backend
- [ ] Error monitoring is set up (optional)
- [ ] Custom domains are configured (optional)

## Monitoring and Maintenance

### Health Checks
- Backend health endpoint: `https://your-backend-url.com/health`
- Monitor API response times
- Check OpenAI API usage and costs

### Updates
- Keep dependencies updated regularly
- Monitor for security vulnerabilities
- Test changes in development before deploying

### Scaling
- Both Vercel and Render/Railway auto-scale
- Monitor usage and upgrade plans as needed
- Consider Redis for session storage with multiple backend instances

## Troubleshooting Deployment

### Common Issues

**Build Failures**
- Check Node.js version compatibility
- Ensure all dependencies are in package.json
- Review build logs for specific errors

**CORS Errors**
- Verify FRONTEND_URL matches your actual frontend URL
- Check for trailing slashes in URLs
- Ensure CORS middleware is configured correctly

**OpenAI API Errors**
- Verify API key is correct and not truncated
- Check API credits and usage limits
- Ensure model name is spelled correctly

**Database Connection Issues**
- Verify MongoDB connection string format
- Check network access settings in MongoDB Atlas
- Test connection string locally first

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [OpenAI API Documentation](https://platform.openai.com/docs)