@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo GymGPT Android Build
echo ========================================
if not exist android\gradlew.bat (
  echo ERROR: Android project not found.
  pause
  exit /b 1
)
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
  echo.
  echo BUILD FAILED. Open the android folder in Android Studio and run Gradle sync/build.
  pause
  exit /b 1
)
echo.
echo BUILD SUCCESSFUL!
echo APK: android\app\build\outputs\apk\debug\app-debug.apk
pause
