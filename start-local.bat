@echo off
title Khu Vuon Cam Xuc Server
chcp 65001 >nul
color 0A

echo ======================================================================
echo       HE THONG TRO LY HOC TAP - KHU VUON CAM XUC
echo ======================================================================
echo.

set ROOT_DIR=%~dp0
echo [1/2] Dang khoi dong Backend API (Hono - Port 8000)...
cd /d "%ROOT_DIR%backend"
start "Sunflower Backend API" cmd /k "bun run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Dang khoi dong Frontend Web App (Vite + React Router - Port 3000)...
cd /d "%ROOT_DIR%frontend"
start "Sunflower Frontend Web" cmd /k "bun run dev"

echo.
echo ======================================================================
echo [THANH CONG] He thong dang chay tren may cua ban tai:
echo  - Frontend Web: http://localhost:3000
echo  - Backend API:  http://localhost:8000
echo ======================================================================
pause
