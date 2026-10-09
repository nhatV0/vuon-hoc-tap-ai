@echo off
title Start All Services
chcp 65001 >nul
call "%~dp0start-local.bat"
