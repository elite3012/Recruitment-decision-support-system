Write-Host "Starting Recruitment Decision Support System..." -ForegroundColor Green

# Start Backend in a new window
Write-Host "Starting Backend (FastAPI)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; ../.venv/Scripts/Activate.ps1; uvicorn main:app --reload --port 8000`"" -WindowStyle Normal

# Start Frontend in a new window
Write-Host "Starting Frontend (React/Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`"" -WindowStyle Normal

Write-Host "Both services are starting up in separate windows!" -ForegroundColor Yellow
Write-Host "- Backend API: http://localhost:8000"
Write-Host "- Frontend UI: http://localhost:5173"
Write-Host "Close the opened windows to stop the services." -ForegroundColor Gray
