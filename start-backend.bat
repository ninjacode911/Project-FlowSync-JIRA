@echo off
cd backend
echo Running database migration...
node scripts/migrate.js
echo.
echo Updating passwords...
node scripts/update-passwords.js
echo.
echo Starting backend server...
npm run dev
