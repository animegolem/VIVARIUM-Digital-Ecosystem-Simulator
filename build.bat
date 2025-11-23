@echo off
echo.
echo 🔬 VIVARIUM Build Script (Windows)
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Visit: https://nodejs.org/
    exit /b 1
)

echo ✓ Node.js found
node --version
echo ✓ npm found
npm --version
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Parse command line arguments
set BUILD_TARGET=%1

if "%BUILD_TARGET%"=="" (
    echo 🏗️  Building for Windows...
    call npm run build:win
) else if "%BUILD_TARGET%"=="all" (
    echo 🏗️  Building for all platforms...
    call npm run build:all
) else if "%BUILD_TARGET%"=="linux" (
    echo 🏗️  Building for Linux...
    call npm run build:linux
) else if "%BUILD_TARGET%"=="win" (
    echo 🏗️  Building for Windows...
    call npm run build:win
) else if "%BUILD_TARGET%"=="mac" (
    echo 🏗️  Building for macOS...
    call npm run build:mac
) else (
    echo ❌ Unknown build target: %BUILD_TARGET%
    echo.
    echo Usage: build.bat [target]
    echo.
    echo Targets:
    echo   (none^)   - Build for Windows
    echo   all      - Build for all platforms
    echo   linux    - Build for Linux
    echo   win      - Build for Windows
    echo   mac      - Build for macOS
    exit /b 1
)

echo.
echo ✅ Build complete!
echo.
echo 📦 Output directory: dist\
dir dist\ 2>nul || echo    (No files yet - build may have failed)
echo.
echo 🚀 To run the app in development mode:
echo    npm start
echo.
pause
