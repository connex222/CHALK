@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "REPORT=%~dp0CHALK-QA-RESULTS.txt"
> "%REPORT%" echo CHALK - OFFLINE BROWSER AND SAVED-BOARD QA
>> "%REPORT%" echo Date: %DATE% %TIME%
>> "%REPORT%" echo No GitHub Actions, merge, changes to saved data or deployment.
where node >nul 2>&1
if errorlevel 1 goto :no_node
where npm >nul 2>&1
if errorlevel 1 goto :no_npm
echo Installing local browser testing...
call npm install --no-save --no-package-lock --no-audit --no-fund playwright@1.56.1 >> "%REPORT%" 2>&1
if errorlevel 1 goto :fail
echo Installing Chromium...
call npx playwright install chromium >> "%REPORT%" 2>&1
if errorlevel 1 goto :fail
echo Testing CHALK...
node tools\qa-browser.js >> "%REPORT%" 2>&1
if errorlevel 1 goto :fail
>> "%REPORT%" echo RESULT: ALL AUTOMATED QA STAGES PASSED.
echo PASS - upload CHALK-QA-RESULTS.txt to ChatGPT.
pause
exit /b 0
:no_node
>> "%REPORT%" echo FAIL: Node.js missing.
goto :fail
:no_npm
>> "%REPORT%" echo FAIL: npm missing.
:fail
>> "%REPORT%" echo RESULT: FAIL. See error details above.
echo FAIL - upload CHALK-QA-RESULTS.txt to ChatGPT.
pause
exit /b 1
