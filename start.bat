@echo off
echo Starting AI Prompt Tools...

echo.
echo === Checking backend environment ===
cd backend
python check_env.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Please fix the environment issues before continuing.
    pause
    exit /b 1
)

echo.
echo === Starting backend server ===
start cmd /k "cd backend && python run.py"

echo.
echo === Starting frontend server ===
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo.
echo Press any key to close this window. The servers will continue running.
pause 