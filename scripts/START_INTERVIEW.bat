@echo off
echo ========================================
echo   Starting AI Interview Simulator
echo ========================================
echo.
echo Starting Backend Server...
echo.

cd /d "%~dp0backend"

REM Check if venv exists
if not exist "venv\Scripts\python.exe" (
    echo ERROR: Virtual environment not found!
    echo Please run setup first.
    pause
    exit /b 1
)

REM Start the backend server
start "AI Interviewer Backend" cmd /k "venv\Scripts\python.exe server_ai_interviewer.py"

echo Backend server starting in new window...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
echo.

cd /d "%~dp0"

REM Start the frontend
start "AI Interviewer Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:5000
echo Frontend: http://localhost:3000
echo.
echo Wait 10 seconds, then open:
echo http://localhost:3000/interview-simulator
echo.
pause
