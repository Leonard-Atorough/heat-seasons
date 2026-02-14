# Heat Seasons - Free/Low-Cost Deployment Plan

## Executive Summary

This plan outlines a complete deployment strategy for your Heat Seasons application (React frontend, Express backend, JSON/database storage) using free or minimal-cost services. Total estimated monthly cost: **$0-5 USD** (free tier with optional upgrades).

---

## Architecture Overview

```
┌─────────────────────────┐
│   Frontend (React)      │
│  Deployed on Vercel     │
│  or Netlify (FREE)      │
└──────────┬──────────────┘
           │ HTTPS
           ▼
┌─────────────────────────┐
│  Backend (Express)      │
│ Deployed on Railway/    │
│ Render (FREE tier)      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Database/Storage       │
│  - Option A: SQLite     │
│  - Option B: PostgreSQL │
│    (FREE tier services) │
└─────────────────────────┘
```

---

## Phase 1: Frontend Deployment (React + Vite)

### Option A: Vercel (Recommended - Optimal for Vite)

**Cost:** FREE tier included

- Unlimited deployments
- Up to 100 GB bandwidth/month
- Automatic builds from Git
- Free SSL/HTTPS
- CDN included

**Setup Process:**

1. Push code to GitHub
2. Connect Vercel to GitHub repository
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on git push

**Build Configuration:**

- Vite already configured (no changes needed)
- Output: `dist/` folder
- Set build command: `npm run build`

### Option B: Netlify (Alternative)

**Cost:** FREE tier included

- Similar to Vercel
- Slightly simpler UI
- Same bandwidth/deployment limits

**Setup Process:**

1. Connect GitHub repository
2. Configure build settings (npm run build)
3. Set environment variables
4. Deploy

---

## Phase 2: Backend Deployment (Node.js + Express)

### Option A: Railway (Recommended)

**Cost:** FREE tier with $5/month credit (essentially free for small apps)

- Auto-deploys from GitHub
- Environment variables management
- PostgreSQL/MySQL included
- Easy scaling

**Setup Process:**

1. Create Railway account (no credit card for free tier)
2. Create new project
3. Connect GitHub repository
4. Add PostgreSQL service (if needed)
5. Set environment variables
6. Deploy on git push

### Option B: Render

**Cost:** FREE tier (with sleep after 15 min inactivity)

- Auto-deploys from GitHub
- Free PostgreSQL (512MB limit)
- Can wake up on request (slight delay)

**Setup Process:**

1. Connect GitHub
2. Create new Web Service
3. Configure build: `npm run build`
4. Configure start: `npm run start`
5. Attach free database if needed

### Option C: Fly.io

**Cost:** FREE tier (3 shared-cpu-1x 256MB VMs)

- Global deployment (bonus)
- Generous free tier
- PostgreSQL available

---

## Phase 3: Database/Storage Migration

### Current State

- Using JSON files via `StorageAdapter`
- Good for development, **NOT suitable for production**
- Issues: No concurrent access, data loss risk, no querying

### Recommended Approach: Minimal Migration

#### Option 1: SQLite (Simplest Transition)

**Recommended** - Requires minimal code changes

- Works with existing StorageAdapter pattern
- Can deploy as file on server
- Free and self-contained

**Implementation:**

1. Create new `SqliteStorageAdapter` implementing `StorageAdapter` interface
2. Use `better-sqlite3` or `sqlite3` package
3. Keep same method signatures
4. Update Container to use SqliteStorageAdapter in production

**Pros:**

- Minimal code changes (adapter pattern)
- No external service needed
- Works on Railway/Render for free

**Cons:**

- Single-user/low-concurrency
- Suitable for hobby project (your use case)

#### Option 2: PostgreSQL (Scalable)

**If you want enterprise-grade solution**

- Free tier available: Railway, Render, Vercel
- Requires more schema setup
- Enables future scaling

**Implementation:**

1. Create PostgreSQL adapter (or use ORM like Prisma)
2. Set up migrations
3. Connect to free PostgreSQL instance

#### Option 3: Keep JSON Files (Quickest)

**If data is small and infrequent updates**

- Store as environment variable or uploaded file
- Works but not recommended for production
- No concurrent access issues if single backend instance

---

## Phase 4: Environment Configuration

### Backend Environment Variables (Needed)

```env
# Server
PORT=3000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://your-domain.com

# OAuth (Google)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/auth/google/callback

# Session/JWT
SESSION_SECRET=random-long-string-here
JWT_SECRET=random-long-string-here

# Database (if using SQLite/PostgreSQL)
DATABASE_URL=postgres://user:password@host:port/dbname

# CORS
CORS_ORIGIN=https://your-domain.com
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-api-domain.com
```

---

## Phase 5: Domain & SSL

### Custom Domain (Optional)

- **Free:** Use subdomain from Railway/Render/Vercel
  - Example: `app.railway.app` or `myapp.vercel.app`
- **Paid (Cheap):** Use custom domain ($10-15/year)
  - Providers: Namecheap, Google Domains, Route53

### SSL Certificate

- **FREE:** Automatic with all deployment platforms
- Both Vercel and Railway provide free HTTPS

---

## Phase 6: CI/CD Pipeline

### GitHub Actions (FREE)

- Automatically build & deploy on git push
- No configuration needed if using Vercel/Railway (they handle it)
- Optional: Add automated tests

---

## Recommended Deployment Stack (Final)

| Component         | Solution          | Cost     | Why                                           |
| ----------------- | ----------------- | -------- | --------------------------------------------- |
| **Frontend**      | Vercel            | $0       | Perfect for Vite, instant global CDN          |
| **Backend**       | Railway           | $0-5     | $5/month credit, easy PostgreSQL, auto-deploy |
| **Database**      | SQLite (embedded) | $0       | Minimal changes, no external service          |
| **Domain**        | Subdomain (free)  | $0       | Start free, upgrade later                     |
| **SSL**           | Automatic         | $0       | Built-in with platforms                       |
| **CI/CD**         | GitHub Actions    | $0       | Free for public repos                         |
| **Total Monthly** |                   | **$0-5** | Essentially free                              |

---

## Step-by-Step Deployment Checklist

### Prerequisites

- [ ] GitHub repository set up
- [ ] Code pushed to main branch
- [ ] All environment variables identified

### Frontend Deployment

- [ ] Create Vercel account (free)
- [ ] Connect GitHub repo
- [ ] Configure VITE_API_URL env var
- [ ] Deploy and test

### Backend Deployment

- [ ] Create Railway account (free)
- [ ] Create new project
- [ ] Connect GitHub repo
- [ ] Configure all environment variables
- [ ] Configure build/start commands
- [ ] Deploy and test
- [ ] Update CORS settings in backend

### Database Setup

- [ ] Decide: SQLite vs PostgreSQL
- [ ] If SQLite: Create adapter, test locally, deploy
- [ ] If PostgreSQL: Add Railway PostgreSQL, migrate schema
- [ ] Seed initial data if needed

### Post-Deployment

- [ ] Test OAuth flow end-to-end
- [ ] Verify CORS headers
- [ ] Check error logging
- [ ] Monitor free tier usage

---

## Cost Breakdown

| Item             | Free Tier             | If Upgraded        |
| ---------------- | --------------------- | ------------------ |
| Frontend hosting | ∞                     | ∞                  |
| Backend hosting  | $0-5 (Railway credit) | $7+/month          |
| Database         | $0 (SQLite)           | $0-15 (PostgreSQL) |
| Domain           | $0 (subdomain)        | $10-15/year        |
| SSL              | $0                    | $0                 |
| **Total/Month**  | **$0-5**              | **$7-20**          |

---

## Scaling Considerations

### When to upgrade (if traffic increases):

1. **Frontend:** Automatic, no upgrade needed
2. **Backend:** Upgrade Railway plan ($7+/month) or use Render paid
3. **Database:** Upgrade to PostgreSQL on Railway/Render ($15+/month)
4. **Domain:** Add custom domain ($1-2/month)

### Free tier limitations:

- Railway: 5GB storage, 100GB bandwidth
- Render: Auto-hibernates after 15 min inactivity (on free tier)
- Vercel: 100GB bandwidth/month
- Perfect for hobby projects and prototypes

---

## Alternative: Ultra-Budget Option

If you want to minimize everything:

| Component    | Solution                    | Cost   |
| ------------ | --------------------------- | ------ |
| **Frontend** | GitHub Pages + Vite         | $0     |
| **Backend**  | Render (with sleep)         | $0     |
| **Database** | JSON files in repo (simple) | $0     |
| **Total**    |                             | **$0** |

**Trade-offs:** Manual deployments, slower backend, no real database

---

## Migration Path

1. **Month 0:** Deploy as-is (with JSON or SQLite)
2. **Month 3-6:** If working well, consider PostgreSQL migration
3. **Month 6+:** Add custom domain ($15/year)
4. **When needed:** Upgrade tiers as traffic grows

---

## Next Steps (To Implement)

1. Prepare environment variables list
2. Create `.env.example` file
3. Test build locally: `npm run build`
4. Create Vercel account and deploy frontend
5. Create Railway account and deploy backend
6. Set up database (SQLite adapter)
7. Test end-to-end
8. Configure domain (optional)

---

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Express Production Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
