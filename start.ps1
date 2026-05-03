Write-Host "Starting Recruitment Decision Support System..." -ForegroundColor Green

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendVenvPython = Join-Path $Root ".venv\Scripts\python.exe"
$BackendActivate = Join-Path $Root ".venv\Scripts\Activate.ps1"
$DbPath = Join-Path $Root "data\app.db"
$FrontendNodeModules = Join-Path $Root "frontend\node_modules"

if (-not (Test-Path $BackendVenvPython)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
    python -m venv (Join-Path $Root ".venv")
}

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
& $BackendVenvPython -m pip install -r (Join-Path $Root "backend\requirements.txt")

if (-not (Test-Path $DbPath)) {
    Write-Host "Seeding local database..." -ForegroundColor Cyan
    & $BackendVenvPython (Join-Path $Root "seed.py")
}

if (-not (Test-Path $FrontendNodeModules)) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location (Join-Path $Root "frontend")
    npm install
    Pop-Location
}

Write-Host "Starting Backend (FastAPI)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$Root\backend'; & '$BackendActivate'; uvicorn main:app --reload --port 8000`"" -WindowStyle Normal

Write-Host "Starting Frontend (React/Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$Root\frontend'; npm run dev`"" -WindowStyle Normal

Write-Host "Both services are starting up in separate windows!" -ForegroundColor Yellow
Write-Host "- Backend API: http://localhost:8000"
Write-Host "- Frontend UI: http://localhost:5173"
Write-Host "Default login: admin / admin123"
Write-Host "Close the opened windows to stop the services." -ForegroundColor Gray
