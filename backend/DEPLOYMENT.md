# Vercel Deployment Guide for Azaya Backend

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables Setup

Before deploying, you need to set up the following environment variables in Vercel:

### Required Environment Variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=8000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/azaya-db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# OR use individual variables:
CLOUD_NAME=your-cloud-name
CLOUD_API_KEY=your-api-key
CLOUD_API_SEC=your-api-secret

# CORS Configuration (for production)
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## Deployment Steps

### Method 1: Deploy via Vercel CLI

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy the project:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? (Select your account)
   - Link to existing project? `N`
   - What's your project's name? `azaya-backend`
   - In which directory is your code located? `./` (current directory)

5. **Set environment variables:**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add CLOUDINARY_URL
   # Add all other environment variables
   ```

6. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

### Method 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to [vercel.com/dashboard](https://vercel.com/dashboard)**

3. **Click "New Project"**

4. **Import your repository**

5. **Configure the project:**
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all the required environment variables listed above

7. **Deploy**

## Post-Deployment Configuration

### 1. Update CORS Settings

After deployment, update your CORS configuration in `server.ts` to include your Vercel domain:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000', // Development
    'https://your-frontend-domain.vercel.app', // Production frontend
    'https://azaya-backend.vercel.app' // Your Vercel backend domain
  ],
  credentials: true
}));
```

### 2. Test Your Deployment

Your API will be available at: `https://azaya-backend.vercel.app`

Test endpoints:
- Health check: `GET https://azaya-backend.vercel.app/`
- API docs: `GET https://azaya-backend.vercel.app/api`

### 3. Update Frontend Configuration

Update your frontend to use the Vercel backend URL:

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://azaya-backend.vercel.app/api'
  : 'http://localhost:8000/api';
```

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check that all dependencies are in `dependencies` not `devDependencies`
   - Ensure TypeScript compilation works locally

2. **Environment Variables:**
   - Make sure all required environment variables are set in Vercel
   - Check that variable names match exactly

3. **Database Connection:**
   - Verify MongoDB Atlas allows connections from Vercel IPs
   - Check MongoDB connection string format

4. **Cloudinary Issues:**
   - Verify Cloudinary credentials are correct
   - Check that CLOUDINARY_URL format is correct

### Useful Commands:

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Remove deployment
vercel remove azaya-backend
```

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] MongoDB Atlas configured for production
- [ ] Cloudinary account configured
- [ ] CORS settings updated for production domains
- [ ] Frontend configured to use production API URL
- [ ] SSL certificates working (automatic with Vercel)
- [ ] API endpoints tested in production

## Monitoring

- Use Vercel Analytics to monitor performance
- Set up error tracking with services like Sentry
- Monitor MongoDB Atlas for database performance
- Check Cloudinary usage and limits

## Security Notes

- Never commit `.env` files to Git
- Use strong, unique JWT secrets
- Regularly rotate API keys
- Monitor API usage and set up rate limiting
- Use HTTPS only (automatic with Vercel)
