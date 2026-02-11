# ⚠️ TEMPORARY BACKEND - DO NOT USE IN PRODUCTION

This is a **temporary mock backend** for demonstration purposes only.

## Purpose
- Enable frontend development without waiting for real backend
- Demonstrate full application functionality
- Store data in JSON files (temporary storage)

## ⚠️ IMPORTANT
**This entire `server/` folder will be DELETED and replaced during Phase 1-3 of the main implementation plan.**

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

All endpoints are **TEMPORARY** and will be replaced.

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Sprints
- `GET /api/sprints` - List all sprints
- `GET /api/sprints/:id` - Get sprint by ID
- `POST /api/sprints` - Create sprint
- `PUT /api/sprints/:id` - Update sprint
- `DELETE /api/sprints/:id` - Delete sprint

### Issues
- `GET /api/issues` - List issues (supports filtering)
- `GET /api/issues/:id` - Get issue by ID
- `POST /api/issues` - Create issue
- `PUT /api/issues/:id` - Update issue
- `PATCH /api/issues/:id/status` - Update issue status
- `DELETE /api/issues/:id` - Delete issue

### Comments
- `GET /api/issues/:issueId/comments` - Get comments for issue
- `POST /api/issues/:issueId/comments` - Add comment
- `DELETE /api/comments/:commentId` - Delete comment

### Search
- `GET /api/search?q=query` - Search issues

## Data Storage

Data is stored in JSON files in the `data/` directory:
- `users.json`
- `projects.json`
- `sprints.json`
- `issues.json`

**⚠️ Data persists only while server is running. Restarting the server resets to seed data.**

## Migration to Real Backend

When implementing the real backend (Phase 1-3):
1. Delete this entire `server/` folder
2. Follow the implementation plan in `documentation/implementation_plan.md`
3. Update frontend services to add proper error handling
4. The API contract (endpoints, request/response format) will remain the same

## What's Missing (Intentionally)
- ❌ Authentication/Authorization
- ❌ Validation
- ❌ Error handling
- ❌ Database
- ❌ File uploads
- ❌ Security measures
- ❌ Tests
- ❌ Logging
- ❌ Rate limiting

All of these will be added in the real implementation.
