@echo off
REM AURA Learn - one-click demo launcher (LAN + local)
REM Starts backend on 0.0.0.0:8000 and frontend on 0.0.0.0:3000
REM Other devices on the same WiFi can open: http://YOUR-LAN-IP:3000
echo.
echo [AURA Learn] Starting backend on 0.0.0.0:8000 ...
start "AURA Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
timeout /t 4 /nobreak >nul
echo [AURA Learn] Starting frontend on 0.0.0.0:3000 ...
start "AURA Frontend" cmd /k "cd /d %~dp0 && npm run dev -- -H 0.0.0.0"
echo.
echo Both servers starting. Open http://localhost:3000 on this PC.
echo To share: find your LAN IP with "ipconfig" (IPv4) and open http://LAN-IP:3000 on other devices.
echo Firewall note: allow Node.js and Python through Windows Firewall (private networks).
