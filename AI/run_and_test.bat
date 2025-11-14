@echo off
REM run_and_test.bat
REM This script sets up a local virtualenv (if missing), installs server deps,
REM runs the test suite (test_app.py) and if tests pass, runs the Flask app.

SETLOCAL ENABLEDELAYEDEXPANSION

REM Find python
where python >nul 2>&1
IF ERRORLEVEL 1 (
  echo Python not found in PATH. Please install Python 3.8+ and re-run this script.
  exit /b 1
)

REM Work from the script's directory (AI folder)
cd /d "%~dp0"

REM Create venv if missing
if not exist ".venv\Scripts\activate.bat" (
  echo Creating virtual environment in .venv...
  python -m venv .venv
  if ERRORLEVEL 1 (
    echo Failed to create virtual environment.
    exit /b 2
  )
)

REM Activate venv
call ".venv\Scripts\activate.bat"

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing server dependencies from requirements-server.txt...
if exist requirements-server.txt (
  pip install -r requirements-server.txt
) else (
  echo requirements-server.txt not found, skipping.
)

REM Also install any AI-specific extras if present
if exist requirements.txt (
  echo Installing additional AI requirements from requirements.txt...
  pip install -r requirements.txt
)

echo Running test suite (all tests)...
REM Run full pytest suite so both test_app.py and AI/tests are executed
python -m pytest -q
if ERRORLEVEL 1 (
  echo.
  echo TESTS FAILED. Server will not start. Fix failures and re-run this script.
  pause
  exit /b 3
)

echo Tests passed. Starting the Flask/SocketIO app (app.py)...
python app.py

ENDLOCAL
