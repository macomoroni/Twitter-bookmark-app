# 🚀 Quick Start Guide

Get your Twitter Bookmarks Organizer running in 5 minutes!

## Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Docker Desktop installed (for PostgreSQL)

## Step-by-Step Setup

### 1. Start Database (30 seconds)

```bash
# From project root
docker-compose up -d

# Verify it's running
docker-compose ps
```

You should see PostgreSQL running on port 5432.

### 2. Setup Backend (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Setup database
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Start backend server
npm run dev
```

✅ Backend should be running on http://localhost:3001

Test it: Open http://localhost:3001/health - you should see `{"status":"ok",...}`

### 3. Setup Frontend (1 minute)

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend should be running on http://localhost:5173

### 4. Build Extension (1 minute)

Open a **new terminal**:

```bash
cd extension

# Install dependencies
npm install

# Build extension
npm run build
```

✅ Extension built in `extension/dist/`

### 5. Install Extension in Browser

**Chrome/Edge:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Navigate to and select `extension/dist` folder
5. Extension installed! 🎉

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` in `extension/dist`
4. Extension installed! 🎉

## First Time Usage

### 1. Create Account (Web App)

1. Open http://localhost:5173
2. Click "Sign up"
3. Enter:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `test123`
4. Click "Sign Up"

✅ You're logged in!

### 2. Configure Extension

1. Click the extension icon in your browser toolbar
2. You should see the popup
3. Login with the same credentials:
   - Email: `test@example.com`
   - Password: `test123`
4. Click "Login"

✅ Extension is now connected!

### 3. Sync Your Bookmarks

1. Go to https://twitter.com/i/bookmarks (or https://x.com/i/bookmarks)
2. The extension will **automatically** detect bookmarks
3. Scroll down to load more bookmarks
4. Extension syncs them in the background

**Or sync manually:**
- Click extension icon → "Sync Bookmarks Now"

### 4. View & Organize

1. Go back to http://localhost:5173
2. You should see your bookmarks!
3. Create categories with the "+ New" button
4. Add tags to organize
5. Use search to find bookmarks

## Troubleshooting

### Backend won't start

```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check backend logs
cd backend
npm run dev
```

### Frontend shows errors

```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Extension not syncing

1. Check you're logged in (click extension icon)
2. Make sure you're on Twitter bookmarks page
3. Open browser console (F12) and check for errors
4. Try manual sync: Extension icon → "Sync Bookmarks Now"

### Database connection error

Make sure Docker is running and PostgreSQL is started:

```bash
docker-compose down
docker-compose up -d
```

## What's Next?

- **Organize:** Create categories and tags
- **Search:** Use the search bar to find bookmarks
- **Filter:** Click categories/tags in sidebar
- **Auto-sync:** Extension syncs automatically as you scroll on Twitter

## Stopping Everything

```bash
# Stop backend (Ctrl+C in terminal)

# Stop frontend (Ctrl+C in terminal)

# Stop database
docker-compose down
```

## Starting Again Later

```bash
# Start database
docker-compose up -d

# Start backend (in one terminal)
cd backend && npm run dev

# Start frontend (in another terminal)
cd frontend && npm run dev
```

---

**Need help?** Check the full [README.md](README.md) for detailed documentation!

**Enjoy organizing your bookmarks! 🔖**
