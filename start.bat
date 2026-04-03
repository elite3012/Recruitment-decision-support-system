@echo off
echo Starting Recruitment Decision Support System...

echo.
echo Starting Backend (FastAPI)...
start "Backend" cmd /c "cd backend && call ..\.venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

echo.
echo Starting Frontend (React/Vite)...
start "Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo Both services are starting up!
echo - Backend will be available at http://localhost:8000
echo - Frontend will be available at http://localhost:5173
echo.
echo Close these windows when you are done.
