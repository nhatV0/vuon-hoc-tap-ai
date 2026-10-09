@echo off
echo ========================================================
echo  KHOI DONG KHU VUON CAM XUC (BACKEND + FRONTEND)
echo ========================================================

echo 1. Dang kiem tra moi truong...
cd backend
start "Sunflower Backend (FastAPI)" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

cd ..\frontend
start "Sunflower Frontend (Next.js)" cmd /k "npm run start"

echo.
echo He thong da khoi dong xong:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8000
echo ========================================================
