# Railway Deployment Guide - E-Learning Portal with PostgreSQL

## Prerequisites
- Railway account (sign up at [railway.app](https://railway.app))
- Git installed on your computer
- Node.js installed locally (for testing)

## Step 1: Prepare Your Project

### 1.1 Create Project Structure
Make sure your project files are organized like this:
```
e-learning-portal/
├── server.js
├── package.json
├── index.html
├── admin-login.html  
├── admin-dashboard.html
├── script.js
├── style.css
├── .env (optional - Railway will handle env vars)
└── README.md
```

### 1.2 Update package.json
Your `package.json` looks good, but make sure it has the start script:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### 1.3 Create .gitignore
Create a `.gitignore` file:
```
node_modules/
.env
.DS_Store
*.log
```

## Step 2: Initialize Git Repository

```bash
# Navigate to your project directory
cd your-project-folder

# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: E-Learning Portal with PostgreSQL"
```

## Step 3: Deploy to Railway

### 3.1 Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your repository or create a new one

### 3.2 Alternative: Deploy via Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 3.3 Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. The database credentials will be auto-generated

## Step 4: Configure Environment Variables

Railway automatically provides database connection variables. Your app should work with the existing code since it uses:
```javascript
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### Environment Variables Available:
- `DATABASE_URL` - Complete connection string (automatically set)
- `PGHOST` - Database host
- `PGPORT` - Database port  
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

## Step 5: Deploy and Test

### 5.1 Automatic Deployment
- Railway automatically deploys when you push to your connected Git repository
- Monitor the build process in Railway dashboard

### 5.2 Manual Deployment (CLI)
```bash
# Deploy latest changes
railway up

# View logs
railway logs

# Open deployed app
railway open
```

## Step 6: Verify Deployment

### 6.1 Check Application Status
1. Open your Railway app URL
2. Verify the main page loads
3. Test admin login (admin/admin123)
4. Check if lessons and quizzes load properly

### 6.2 Database Verification
Your app will automatically:
- Create necessary tables (`lessons` and `questions`)
- Seed initial data (2 lessons + 30 quiz questions)
- Handle all database operations

## Step 7: Production Considerations

### 7.1 Update Admin Credentials
For production, update the admin credentials in `server.js`:
```javascript
const ADMIN_CREDENTIALS = {
    username: 'your-secure-username',
    password: 'your-secure-password'
};
```

### 7.2 Add Environment Variables (Optional)
In Railway dashboard → Variables:
```
NODE_ENV=production
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-password
```

Then update `server.js`:
```javascript
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
};
```

## Step 8: Maintenance and Updates

### 8.1 View Database
- Use Railway's built-in database browser
- Or connect via external tools using provided credentials

### 8.2 Monitor Application
```bash
# View real-time logs
railway logs --follow

# Check service status
railway status
```

### 8.3 Scale if Needed
Railway automatically handles scaling, but you can:
- Monitor usage in dashboard
- Upgrade plan if needed
- Add custom domains

## Troubleshooting

### Common Issues:

**Build Fails:**
- Check `package.json` has correct start script
- Ensure all dependencies are listed
- Check Railway build logs

**Database Connection Error:**
- Verify PostgreSQL service is running in Railway
- Check if DATABASE_URL is set correctly
- Review connection logs

**App Not Loading:**
- Check Railway logs for errors
- Verify port configuration (Railway automatically sets PORT)
- Ensure static files are served correctly

### Debug Commands:
```bash
# Check deployment status
railway status

# View environment variables
railway variables

# Connect to database
railway run psql
```

## Success Indicators

✅ **Railway app URL loads the learning portal**  
✅ **Admin login works (admin/admin123)**  
✅ **Database tables created automatically**  
✅ **30 quiz questions loaded**  
✅ **2 lessons available**  
✅ **Admin can add/delete content**  

## Final Notes

- Your app will be available at: `https://your-app-name.up.railway.app`
- PostgreSQL database is fully managed by Railway
- Automatic backups and SSL are included
- No additional configuration needed - your code is Railway-ready!

The application will automatically initialize the database with sample content on first run, making it immediately usable for cybersecurity education.