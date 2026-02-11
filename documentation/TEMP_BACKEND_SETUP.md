# ⚠️ TEMPORARY BACKEND SETUP GUIDE

This guide explains how to run the **temporary mock backend** for FlowSync.

> **CRITICAL**: This is a temporary implementation. All code will be replaced during Phase 1-3.

---

## Quick Start

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Start the Backend Server

```bash
# From the server directory
npm run dev
```

The server will start on `http://localhost:5000`

You should see:
```
╔════════════════════════════════════════════════════════════╗
║  ⚠️  TEMPORARY MOCK BACKEND - NOT FOR PRODUCTION  ⚠️       ║
╚════════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:5000
📊 Health check: http://localhost:5000/health
```

### 3. Install Frontend Dependencies (if not already done)

```bash
# From the project root
npm install
```

This will install `axios` which is needed for API calls.

### 4. Start the Frontend

```bash
# From the project root
npm run dev
```

The frontend will start on `http://localhost:3000`

---

## What's Different?

### Before (Mock Data)
- Data stored in `constants.ts`
- All operations in-memory
- Data lost on page refresh

### Now (Temporary Backend)
- Data stored in JSON files (`server/data/*.json`)
- API calls using axios
- Data persists during server session
- **Still lost when server restarts**

---

## Testing the Integration

1. **Create an issue** - Should save to `server/data/issues.json`
2. **Drag and drop** - Status changes should persist
3. **Add comments** - Should save to the issue
4. **Refresh the page** - Data should still be there (as long as server is running)
5. **Restart the server** - Data resets to seed data

---

## Troubleshooting

### Port Already in Use
If port 5000 is in use:
1. Edit `server/.env.example` → `PORT=5001`
2. Edit `.env.local` → `VITE_API_URL=http://localhost:5001/api`
3. Restart both servers

### CORS Errors
The backend has CORS enabled for all origins. If you still see CORS errors:
- Make sure the backend is running
- Check the browser console for the actual error
- Verify `VITE_API_URL` in `.env.local` is correct

### Data Not Persisting
- Make sure the backend server is running
- Check browser console for API errors
- Verify network tab shows successful API calls

### TypeScript Errors
Some TypeScript errors are expected until dependencies are installed:
```bash
npm install axios
```

---

## File Structure

```
server/
├── package.json          # Backend dependencies
├── server.js             # Main Express server (TEMPORARY)
├── data/                 # JSON file storage (TEMPORARY)
│   ├── users.json
│   ├── projects.json
│   ├── sprints.json
│   └── issues.json
└── README.md

src/services/             # Frontend API layer (TEMPORARY)
├── api.ts                # Axios configuration
├── projectService.ts     # Project API calls
├── issueService.ts       # Issue API calls
├── sprintService.ts      # Sprint API calls
├── userService.ts        # User API calls
└── commentService.ts     # Comment API calls

context/
└── ProjectContext.tsx    # Updated to use API (TEMPORARY changes)
```

---

## What to Replace Later

When implementing the real backend (Phase 1-3):

### Delete Entirely
- ❌ `server/` folder
- ❌ All `// TEMPORARY` comments

### Update
- ✅ `src/services/*.ts` - Add proper error handling, caching
- ✅ `context/ProjectContext.tsx` - Add optimistic updates, better state management
- ✅ `.env.local` - Update API URL to production backend

### Keep
- ✅ API contract (endpoints, request/response formats)
- ✅ Service layer structure
- ✅ Component code (no changes needed)

---

## Next Steps

With this temporary backend running, you can:
1. ✅ Demonstrate the full application
2. ✅ Continue frontend development
3. ✅ Test user workflows
4. ✅ Gather stakeholder feedback
5. ✅ Develop real backend in parallel

**When ready, follow `documentation/implementation_plan.md` for the real implementation.**

---

## Support

If you encounter issues:
1. Check both servers are running
2. Verify `.env.local` has correct API URL
3. Check browser console for errors
4. Check server terminal for errors

Remember: This is temporary! Don't spend too much time debugging - focus on the real implementation.
