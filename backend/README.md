# FlowSync Backend API

Production-ready Node.js/Express backend for FlowSync task management system with PostgreSQL database.

## Features

- ✅ JWT Authentication with role-based access control (Admin/Client)
- ✅ PostgreSQL database with comprehensive schema
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
- PostgreSQL >= 13
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:

```sql
CREATE DATABASE flowsync;
```

3. Run the migration script:

```bash
npm run migrate
```

#### Option B: Cloud PostgreSQL (Railway, Render, etc.)

1. Create a PostgreSQL database on your cloud provider
2. Copy the connection string
3. Update `.env` file with the connection string

### 3. Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/flowsync

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email (optional for development)
SMTP_HOST=smtp.sendgrid.net
SMTP_PASS=your-sendgrid-api-key
```

### 4. Run Database Migration

```bash
npm run migrate
```

This will create all tables, indexes, and seed data.

### 5. Start the Server

#### Development mode (with auto-reload):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

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
│   │   └── database.js          # PostgreSQL connection
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

### Docker Deployment

1. Build the image:
```bash
docker build -t flowsync-backend .
```

2. Run the container:
```bash
docker run -p 5000:5000 --env-file .env flowsync-backend
```

### Cloud Deployment (Railway, Render, etc.)

1. Push code to GitHub
2. Connect repository to cloud provider
3. Set environment variables
4. Deploy

## Troubleshooting

### Database Connection Issues

If you see "database connection failed":
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env`
3. Check firewall settings
4. Ensure database exists

### Port Already in Use

If port 5000 is in use:
1. Change PORT in `.env`
2. Or kill the process: `lsof -ti:5000 | xargs kill`

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
