@echo off
setlocal

echo Starting Recruitment Decision Support System...

set ROOT=%~dp0
set VENV_PYTHON=%ROOT%.venv\Scripts\python.exe
set VENV_ACTIVATE=%ROOT%.venv\Scripts\activate.bat
set DB_PATH=%ROOT%data\app.db
set FRONTEND_NODE_MODULES=%ROOT%frontend\node_modules

if not exist "%VENV_PYTHON%" (
    echo.
    echo Creating Python virtual environment...
    python -m venv "%ROOT%.venv"
    if errorlevel 1 exit /b 1
)

echo.
echo Installing backend dependencies...
"%VENV_PYTHON%" -m pip install -r "%ROOT%backend\requirements.txt"
if errorlevel 1 exit /b 1

if not exist "%DB_PATH%" (
    echo.
    echo Seeding local database...
    "%VENV_PYTHON%" "%ROOT%seed.py"
    if errorlevel 1 exit /b 1
)

if not exist "%FRONTEND_NODE_MODULES%" (
    echo.
    echo Installing frontend dependencies...
    pushd "%ROOT%frontend"
    npm install
    if errorlevel 1 exit /b 1
    popd
)

echo.
echo Starting Backend (FastAPI)...
start "Backend" cmd /k "cd /d ""%ROOT%backend"" && call ""%VENV_ACTIVATE%"" && uvicorn main:app --reload --port 8000"

echo.
echo Starting Frontend (React/Vite)...
start "Frontend" cmd /k "cd /d ""%ROOT%frontend"" && npm run dev"

echo.
echo Both services are starting up!
echo - Backend will be available at http://localhost:8000
echo - Frontend will be available at http://localhost:5173
echo - Default login: admin / admin123
echo.
echo Close these windows when you are done.
