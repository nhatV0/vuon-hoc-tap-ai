@echo off
title BACKEND - Vuon Hoa AI (Port 8000)
cd /d "%~dp0backend"
echo [1/2] Dang khoi dong Backend tai http://localhost:8000 ...
python -m uvicorn app.main:app --reload --port 8000
pause
