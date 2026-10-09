@echo off
title FRONTEND - Vuon Hoa AI (Port 3000)
cd /d "%~dp0frontend"
echo [2/2] Dang khoi dong Frontend tai http://localhost:3000 ...
call npm run dev
pause
