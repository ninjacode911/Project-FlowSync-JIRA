# FlowSync Backend API

Production-ready Node.js/Express backend for FlowSync task management system with **SQLite database** (lightweight & serverless).

## Why SQLite?

✅ **Zero Configuration** - No database server setup required  
✅ **Serverless** - Embedded directly in your application  
✅ **Lightweight** - Single file database (~100KB overhead)  
✅ **Fast** - Optimized for read-heavy workloads  
✅ **Easy Deployment** - Works on any platform, no external dependencies  
✅ **ACID Compliant** - Reliable transactions  
✅ **Perfect for Web Apps** - Handles thousands of concurrent users  

## Features

- ✅ JWT Authentication with role-based access control (Admin/Client)
- ✅ SQLite database with comprehensive schema
- ✅ Review workflow system (submit, approve, reject)
- ✅ Time tracking and deadline management
- ✅ Real-time notifications
- ✅ File upload support
- ✅ Email notifications
- ✅ Activity logging and audit trail
- ✅ Rate limiting and security headers
- ✅ Comprehensive error handling

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- **That's it!** No database server needed

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file (minimal configuration needed):

```env
# Database (SQLite - just specify the path)
DATABASE_PATH=./data/flowsync.db

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Run Database Migration

```bash
npm run migrate
```

This creates the database file and all tables automatically.

### 4. Start the Server

#### Development mode (with auto-reload):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Database Location

The SQLite database is stored as a single file:
- **Path**: `./data/flowsync.db`
- **Size**: ~100KB when empty, grows with data
- **Backup**: Just copy this file!

### WAL Mode Enabled

The database uses Write-Ahead Logging (WAL) mode for:
- Better concurrency
- Faster writes
- No blocking on reads

This creates two additional files:
- `flowsync.db-shm` (shared memory)
- `flowsync.db-wal` (write-ahead log)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create client account
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Issues/Tasks
- `GET /api/issues` - List issues (admin sees all, client sees assigned)
- `POST /api/issues` - Create task (admin only)
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `PATCH /api/issues/:id/status` - Update status

### Review Workflow
- `POST /api/reviews/:issueId/submit` - Submit for review (client)
- `POST /api/reviews/:issueId/approve` - Approve work (admin)
- `POST /api/reviews/:issueId/reject` - Request changes (admin)
- `GET /api/reviews/:issueId/history` - Get review history

### Comments
- `GET /api/issues/:issueId/comments` - Get comments
- `POST /api/issues/:issueId/comments` - Add comment
- `PUT /api/comments/:id` - Edit comment
- `DELETE /api/comments/:id` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## Default Accounts (Development)

After running migrations, these accounts are available:

**Admin Account:**
- Email: `admin@flowsync.com`
- Password: `admin123`

**Client Accounts:**
- Email: `john@client.com` / Password: `client123`
- Email: `sarah@client.com` / Password: `client123`

⚠️ **Change these passwords in production!**

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # SQLite connection
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── roleCheck.js         # Role-based access
│   │   └── errorHandler.js      # Error handling
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── users.js             # User management
│   │   ├── issues.js            # Issue CRUD
│   │   ├── reviews.js           # Review workflow
│   │   └── ...
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── issueController.js
│   │   └── ...
│   ├── services/
│   │   ├── emailService.js
│   │   ├── notificationService.js
│   │   └── ...
│   └── index.js                 # App entry point
├── migrations/
│   └── 001_initial_schema.sql   # Database schema
├── scripts/
│   └── migrate.js               # Migration runner
├── data/
│   └── flowsync.db              # SQLite database (created by migration)
├── package.json
└── .env.example
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Security Features

- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation with express-validator

## Deployment

### Simple Deployment (Vercel, Netlify, Railway, Render)

1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy!

The SQLite database file will be created automatically on first run.

### Docker Deployment

1. Build the image:
```bash
docker build -t flowsync-backend .
```

2. Run the container:
```bash
docker run -p 5000:5000 -v $(pwd)/data:/app/data --env-file .env flowsync-backend
```

**Note**: Use volume mount (`-v`) to persist the database file.

## Database Backup

### Backup
```bash
# Simple file copy
cp ./data/flowsync.db ./backups/flowsync-backup-$(date +%Y%m%d).db
```

### Restore
```bash
# Copy backup file back
cp ./backups/flowsync-backup-20260211.db ./data/flowsync.db
```

## Performance Tips

### For Production:
1. **Enable WAL mode** (already enabled by default)
2. **Use indexes** (already created in schema)
3. **Connection pooling** (handled by sqlite3 library)
4. **Regular VACUUM** (optional, for cleanup):
   ```sql
   VACUUM;
   ```

### Scaling Considerations:

SQLite handles:
- ✅ Thousands of concurrent readers
- ✅ Hundreds of writes per second
- ✅ Databases up to 281 TB
- ✅ Millions of rows

For most web apps, SQLite is **more than sufficient**.

## Troubleshooting

### Database Locked Error

If you see "database is locked":
1. Check if WAL mode is enabled (it is by default)
2. Ensure no other process is accessing the database
3. Increase timeout in database config

### Migration Fails

If migration fails:
1. Delete `./data/flowsync.db`
2. Run `npm run migrate` again

### Port Already in Use

If port 5000 is in use:
1. Change PORT in `.env`
2. Or kill the process: `lsof -ti:5000 | xargs kill` (Mac/Linux)

## SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Setup | Zero config | Requires server |
| Deployment | Single file | External service |
| Cost | Free | May require hosting |
| Performance | Excellent for <100K users | Better for millions |
| Backup | Copy file | pg_dump required |
| Scaling | Vertical only | Horizontal + Vertical |
| Best For | Web apps, startups | Enterprise, high traffic |

**For FlowSync**: SQLite is perfect! ✅

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
