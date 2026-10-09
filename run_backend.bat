@echo off
title Sunflower Backend API (Hono)
chcp 65001 >nul
cd /d "%~dp0backend"
echo Dang khoi chay Hono Backend tren cong 8000...
bun run dev
pause
