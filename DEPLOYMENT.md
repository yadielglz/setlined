# 🚀 SetLined Deployment Guide

## Prerequisites

Before deploying SetLined, ensure you have:

1. **Firebase Project** set up with:
   - Authentication enabled (Email/Password)
   - Firestore Database created
   - Security rules configured (see `firebase-auth-setup.md`)

2. **GitHub Repository** created

3. **Netlify Account** (free tier available)

## 📋 Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Navigate to your project directory
cd setlined

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: SetLined customer tracking app"

# Create GitHub repository and push
# (Replace with your GitHub username and repository name)
git remote add origin https://github.com/yourusername/setlined.git
git push -u origin main
```

### 2. Deploy to Netlify

#### Option A: Using Netlify Dashboard (Recommended)

1. **Go to Netlify**: https://app.netlify.com/
2. **Click "Add new site"** → **"Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Build Settings** (should auto-detect):
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **Click "Deploy site"**

#### Option B: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy (from project root)
netlify deploy --prod --dir=dist

# Or link to existing site
netlify link
netlify build
netlify deploy --prod --dir=dist
```

### 3. Configure Environment Variables

In your Netlify dashboard:

1. **Go to Site Settings** → **Environment Variables**
2. **Add the following variables** (get values from Firebase Console):

```
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4. Set Up Custom Domain (Optional)

1. **Go to Site Settings** → **Domain Management**
2. **Add custom domain** or use the generated `.netlify.app` domain
3. **Update Firebase authorized domains** to include your custom domain

### 5. Configure Firebase for Production

In Firebase Console:

1. **Go to Authentication** → **Settings** → **Authorized Domains**
2. **Add your Netlify domain** (e.g., `your-site.netlify.app`)
3. **Ensure Firestore security rules** are deployed

## 🔧 Build Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npm run build -- --analyze
```

### Performance Optimization

The app is already optimized with:
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Optimized images
- ✅ Minified CSS/JS
- ✅ Gzip compression (via Netlify)

## 🧪 Testing Your Deployment

### 1. Test Authentication
- Create a new account
- Verify email functionality
- Test login/logout

### 2. Test Core Features
- Add customers, leads, appointments
- Test real-time updates
- Verify search and filtering

### 3. Test Mobile Responsiveness
- Use browser dev tools
- Test on actual mobile devices

### 4. Test Performance
- Use Lighthouse in Chrome DevTools
- Check Core Web Vitals

## 🚨 Troubleshooting

### Common Issues

#### Build Fails
```bash
# Check build logs in Netlify dashboard
# Common fixes:
npm run build  # Test locally first
```

#### Environment Variables Not Working
- Ensure variable names match exactly
- Restart deployment after adding variables
- Check Firebase configuration

#### Routing Issues
- Verify `_redirects` file is in `public/` directory
- Check `netlify.toml` configuration

#### Firebase Connection Issues
- Verify authorized domains in Firebase
- Check environment variables
- Ensure Firestore security rules are deployed

### Performance Issues

#### Slow Loading
- Enable Netlify's asset optimization
- Check bundle size (`npm run build -- --analyze`)
- Optimize images and assets

#### Real-time Updates Not Working
- Check Firestore security rules
- Verify Firebase configuration
- Check browser console for errors

## 📊 Monitoring & Analytics

### Netlify Analytics
- View in Netlify dashboard
- Monitor performance metrics
- Track user engagement

### Firebase Analytics (Optional)
```javascript
// Add to firebase.ts if you want analytics
import { getAnalytics } from 'firebase/analytics';

const analytics = getAnalytics(app);
```

## 🔒 Security Checklist

- ✅ Environment variables configured
- ✅ Firebase security rules deployed
- ✅ HTTPS enabled (automatic on Netlify)
- ✅ Authorized domains configured
- ✅ Password policies set in Firebase

## 🎯 Post-Deployment

### 1. Set Up Team Access
- Invite team members to Netlify
- Configure access levels
- Set up deployment notifications

### 2. Configure Backups
- Firebase automatic backups
- Consider additional backup strategies

### 3. Monitor Usage
- Set up alerts for errors
- Monitor performance metrics
- Track user adoption

## 📞 Support

If you encounter issues:

1. **Check Netlify build logs**
2. **Verify Firebase configuration**
3. **Test locally first**: `npm run build`
4. **Check browser console** for errors

## 🚀 You're Live!

Once deployed, your SetLined app will be available at:
- **Production URL**: `https://your-site.netlify.app`
- **Admin Panel**: Accessible to all authenticated users

**Congratulations! Your T-Mobile customer tracking system is now live! 🎉**