@echo off
setlocal EnableExtensions
title Market Strategy LCE SDK Tests
color 0A
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [FAIL] Node.js was not found. Install Node.js 20+.
  pause
  exit /b 1
)
node scripts\check-all.mjs
if errorlevel 1 pause & exit /b 1
npm test
if errorlevel 1 pause & exit /b 1
npm run audit:engines
if errorlevel 1 pause & exit /b 1
npm run demo:decision
if errorlevel 1 pause & exit /b 1
echo [PASS] All SDK checks passed.
pause
