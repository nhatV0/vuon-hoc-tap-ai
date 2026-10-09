@echo off
title CHAY TOAN BO HE THONG - VUON HOA AI
echo ========================================================
echo   KHOI DONG HE THONG DU AN NHA GIAO SANG TAO AI
echo ========================================================
echo.
echo 1. Dang mo cua so Backend (Port 8000)...
start "Backend - FastAPI" cmd /k ""%~dp0run_backend.bat""

ping 127.0.0.1 -n 3 > nul

echo 2. Dang mo cua so Frontend (Port 3000)...
start "Frontend - Next.js" cmd /k ""%~dp0run_frontend.bat""

echo.
echo Da khoi chay xong 2 cua so!
echo - Web: http://localhost:3000
echo - API Docs: http://localhost:8000/docs
echo.
timeout /t 5
