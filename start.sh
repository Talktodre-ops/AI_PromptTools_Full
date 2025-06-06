#!/bin/bash

echo "Starting AI Prompt Tools..."

echo
echo "=== Checking backend environment ==="
cd backend
python check_env.py
if [ $? -ne 0 ]; then
    echo
    echo "Please fix the environment issues before continuing."
    read -p "Press Enter to exit..."
    exit 1
fi

echo
echo "=== Starting backend server ==="
python run.py &
BACKEND_PID=$!

echo
echo "=== Starting frontend server ==="
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are running..."
echo "- Backend: http://localhost:8000"
echo "- Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers."

# Function to kill processes on exit
function cleanup {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

# Register the cleanup function to be called on SIGINT
trap cleanup SIGINT

# Wait for Ctrl+C
while true; do
    sleep 1
done 