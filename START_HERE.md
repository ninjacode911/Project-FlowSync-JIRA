# FlowSync - Quick Start Guide

## Prerequisites
- Node.js >= 18.0.0 installed
- npm installed

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
npm install
```

## Step 2: Setup Database

Run the migration script to create the database:
```bash
cd backend
npm run migrate
```

Then update the password hashes:
```bash
node scripts/update-passwords.js
```

## Step 3: Start the Servers

### Option A: Use Batch Files (Windows)
1. Double-click `start-backend.bat` to start the backend
2. Open a new terminal and double-click `start-frontend.bat` to start the frontend

### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Default Login Credentials

**Admin:**
- Email: `admin@flowsync.com`
- Password: `admin123`

**Client:**
- Email: `john@client.com` or `sarah@client.com`
- Password: `client123`

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:
1. Change `PORT` in `backend/.env`
2. Update `VITE_API_URL` in `.env.local` to match

### Database Errors
If you see database errors:
1. Delete `backend/data/flowsync.db` if it exists
2. Run `npm run migrate` again in the backend directory

### CORS Errors
Make sure:
- Backend is running on port 5000
- Frontend `.env.local` has `VITE_API_URL=http://localhost:5000/api`
- Both servers are running

## What's Fixed

✅ Missing PATCH route for issue status updates
✅ Status/priority/type value normalization
✅ Issue key generation (PROJECT-123 format)
✅ Comments fetching from database
✅ Linked issues fetching
✅ Sprint status mapping
✅ ProjectContext using AuthContext
✅ Issue creation with projectId
✅ All API endpoints working
✅ Proper error handling

Enjoy your FlowSync application! 🚀
