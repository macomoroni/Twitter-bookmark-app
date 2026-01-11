# 🔖 Twitter Bookmarks Organizer

A full-stack application to organize, search, and manage your Twitter bookmarks with a browser extension that automatically syncs your bookmarks.

## ✨ Features

- 🚀 **Automatic Background Sync** - Syncs every 15-360 minutes WITHOUT needing to visit Twitter! (See [BACKGROUND-SYNC.md](BACKGROUND-SYNC.md))
  - Runs in background while you browse
  - Configurable sync intervals (15min - 6 hours)
  - Desktop notifications for new bookmarks
  - No manual work required!
- 🤖 **Auto-Organization** - AI-powered automatic categorization and tagging! (See [AUTO-ORGANIZATION.md](AUTO-ORGANIZATION.md))
  - 12 built-in categories (Tech, AI, Business, Science, etc.)
  - Smart tag extraction with NLP
  - Detects programming languages and tech stack
  - Optional OpenAI integration for advanced categorization
- 🔍 **Powerful Search** - Full-text search with filters by categories, tags, authors, and dates
- 🏷️ **Categories & Tags** - Auto-organized or manually customizable
- 📊 **Statistics** - Track your bookmark collection with insightful stats
- 🎨 **Modern UI** - Clean, responsive interface built with React and Tailwind CSS
- 🔐 **Secure** - JWT authentication with bcrypt password hashing
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- RESTful API

**Frontend:**
- React + TypeScript
- Tailwind CSS
- React Query (data fetching)
- Zustand (state management)
- Vite (build tool)

**Browser Extension:**
- Vanilla TypeScript
- Chrome Extension Manifest V3
- Works on Twitter/X bookmarks page

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Docker & Docker Compose (optional, for easy setup)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   cd Twitter-bookmark-app
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred values
   ```

3. **Start the database**
   ```bash
   docker-compose up -d
   ```

4. **Setup backend**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npx prisma generate
   npm run dev
   ```

5. **Setup frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Build browser extension** (in a new terminal)
   ```bash
   cd extension
   npm install
   npm run build
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/health

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp ../.env.example .env
# Edit .env with your database credentials

# Run PostgreSQL (if not using Docker)
# Make sure PostgreSQL is running on localhost:5432

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

#### Browser Extension Setup

```bash
cd extension

# Install dependencies
npm install

# Build extension
npm run build

# The extension will be built to extension/dist/
```

## 🔌 Installing the Browser Extension

### Chrome/Edge

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder
5. The extension icon should appear in your toolbar

### Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in the `extension/dist` folder
4. The extension is now loaded (temporary, will be removed on browser restart)

## 📖 Usage Guide

### 1. Create an Account

1. Open http://localhost:5173
2. Click "Sign up"
3. Enter your email, username, and password
4. You'll be automatically logged in

### 2. Configure Browser Extension

1. Click the extension icon in your browser
2. Configure the API URL (default: http://localhost:3001/api)
3. Enter your login credentials
4. Click "Login"

### 3. Sync Bookmarks

**Option A: Automatic Sync**
1. Go to https://twitter.com/i/bookmarks (or https://x.com/i/bookmarks)
2. The extension will automatically detect bookmarks on the page
3. Scroll down to load more bookmarks
4. Extension syncs in the background every few seconds

**Option B: Manual Sync**
1. Go to Twitter bookmarks page
2. Click the extension icon
3. Click "Sync Bookmarks Now"

### 4. Enjoy Auto-Organization! 🤖

**Your bookmarks are automatically organized!**

When you sync bookmarks, they are automatically:
- ✅ **Categorized** into 12 built-in categories (Tech, AI, Business, etc.)
- ✅ **Tagged** with relevant keywords, hashtags, and topics
- ✅ **Organized** by author, tech stack, and programming languages

**No manual work required!** 🎉

**Want to customize?**
- Create custom categories (click "+ New" under Categories)
- Add/remove tags manually
- Edit any bookmark's organization

**Search & Filter:**
- Use the search bar to find bookmarks by text, author, or content
- Filter by auto-assigned categories and tags in the sidebar
- Sort by date, relevance, or author

**Learn more:** See [AUTO-ORGANIZATION.md](AUTO-ORGANIZATION.md) for detailed documentation.

## 🗄️ Database Schema

```
users
  - id, email, username, password, createdAt, updatedAt

bookmarks
  - id, userId, tweetId, tweetUrl, text, authorName, authorUsername
  - authorProfileImage, mediaUrls[], createdAt, addedAt, updatedAt

categories
  - id, userId, name, color, icon, createdAt, updatedAt

tags
  - id, userId, name, createdAt

bookmark_categories (junction table)
  - bookmarkId, categoryId, createdAt

bookmark_tags (junction table)
  - bookmarkId, tagId, createdAt
```

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/register   - Register new user
POST   /api/auth/login      - Login
GET    /api/auth/me         - Get current user
```

### Bookmarks
```
GET    /api/bookmarks           - Get all bookmarks (paginated)
GET    /api/bookmarks/:id       - Get single bookmark
POST   /api/bookmarks           - Create bookmark
POST   /api/bookmarks/bulk      - Bulk create bookmarks
PATCH  /api/bookmarks/:id       - Update bookmark
DELETE /api/bookmarks/:id       - Delete bookmark
```

### Categories
```
GET    /api/categories          - Get all categories
GET    /api/categories/:id      - Get single category
POST   /api/categories          - Create category
PATCH  /api/categories/:id      - Update category
DELETE /api/categories/:id      - Delete category
```

### Tags
```
GET    /api/tags                - Get all tags
POST   /api/tags                - Create tag
DELETE /api/tags/:id            - Delete tag
```

### Search
```
GET    /api/search              - Search bookmarks with filters
GET    /api/search/stats        - Get statistics
```

## 🐳 Production Deployment

### Using Docker Compose

1. **Setup production environment**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with secure values
   ```

2. **Build and start services**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

3. **Access the application**
   - Frontend: http://your-domain.com
   - Backend: http://your-domain.com/api

### Manual Deployment

#### Backend

```bash
cd backend
npm install
npm run build
npx prisma migrate deploy
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm run build
# Serve the dist/ folder with nginx or similar
```

## 🔒 Security Considerations

- **Never commit `.env` files** - They contain sensitive credentials
- **Use strong JWT secrets** - Generate random strings for JWT_SECRET
- **HTTPS in production** - Always use HTTPS for production deployments
- **Rate limiting** - API has built-in rate limiting (100 req/15min)
- **Password hashing** - Passwords are hashed with bcrypt (10 rounds)
- **CORS** - Configure CORS_ORIGIN for production

## 🛠️ Development

### Project Structure

```
Twitter-bookmark-app/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app
│   └── package.json
├── extension/
│   ├── src/
│   │   ├── background.ts   # Background script
│   │   ├── content.ts      # Content script
│   │   └── popup.ts        # Popup script
│   ├── public/
│   │   ├── manifest.json   # Extension manifest
│   │   └── popup.html      # Popup HTML
│   └── package.json
├── docker-compose.yml      # Development compose
├── docker-compose.prod.yml # Production compose
└── README.md
```

### Available Scripts

**Backend:**
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

**Frontend:**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Extension:**
```bash
npm run dev          # Build in watch mode
npm run build        # Build for production
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** "Can't reach database server"
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Extension Not Syncing

1. Check if you're logged in (click extension icon)
2. Make sure you're on Twitter bookmarks page
3. Check browser console for errors (F12)
4. Verify backend is running (http://localhost:3001/health)

### CORS Errors

Update `CORS_ORIGIN` in backend `.env`:
```
CORS_ORIGIN=http://localhost:5173
```

## 📝 Environment Variables

### Backend (.env)

```bash
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/twitter_bookmarks?schema=public
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3001/api
```

## 🎯 Roadmap

- [ ] Export bookmarks (JSON, CSV, PDF)
- [ ] Import bookmarks from Twitter archive
- [ ] AI-powered auto-categorization
- [ ] Thread detection (group related tweets)
- [ ] Shared collections
- [ ] Browser extension for Firefox (permanent)
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Duplicate detection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with TypeScript, React, and Express
- Database powered by PostgreSQL and Prisma
- UI styled with Tailwind CSS

---

**Happy Bookmarking! 🔖**

If you find this project useful, please consider giving it a star on GitHub!
