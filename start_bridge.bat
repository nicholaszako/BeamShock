@echo off

cd bridge

REM No venv -> first-time setup
IF NOT EXIST ".venv\Scripts\activate.bat" (
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
)

call .venv\Scripts\activate.bat
python -m main
