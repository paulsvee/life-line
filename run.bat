@echo off
cd /d "%~dp0"
start "" cmd /k "npm run dev -- -p 3008"
timeout /t 3 >nul
start "" "http://localhost:3008"
exit
