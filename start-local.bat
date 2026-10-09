@echo off
title Khu Vuon Cam Xuc Server
chcp 65001 >nul
color 0A

echo ======================================================================
echo       🌻 HE THONG TRỢ LÝ HỌC TẬP - KHU VƯỜN CẢM XÚC 🌻
echo ======================================================================
echo.

set ROOT_DIR=%~dp0
echo [1/2] Dang khoi dong Backend API (FastAPI - Port 8000)...
cd /d "%ROOT_DIR%backend"
start "Sunflower Backend API" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Dang khoi dong Frontend Web App (Next.js - Port 3000)...
cd /d "%ROOT_DIR%frontend"
start "Sunflower Frontend Web" cmd /k "npm run start"

echo.
echo ======================================================================
echo [THANH CONG] He thong dang chay tren may cua ban tai:
echo  - Frontend Web: http://localhost:3000
echo  - Backend API:  http://localhost:8000
echo  - Tai lieu API: http://localhost:8000/docs
echo ======================================================================
echo Giu 2 cua so nay de he thong luon hoat dong.
echo.
pause
