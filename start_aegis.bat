@echo off
echo Starting Aegis Flow Finance...

echo 1. Starting FastAPI Backend...
start cmd /k "pip install -r requirements.txt && uvicorn backend.main:app --reload"

echo 2. Starting React Dashboard...
start cmd /k "cd frontend\app && npm install && npm run dev"

echo All services are starting up! 
echo Backend will be at http://localhost:8000
echo Frontend will be at http://localhost:5173
