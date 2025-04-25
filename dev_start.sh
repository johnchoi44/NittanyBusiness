#!/bin/bash

FILE=./backend/nittanybusiness.db

## Clear db for reset
#if [ -f "$FILE" ]; then
#    echo "Removing old db file..."
#    rm "$FILE"
#fi

# Kill both processes on Ctrl+C
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

# Start Node backend in background
echo "Starting Node server..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Start React frontend in background
echo "Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!

# Wait for both to finish (keeps script running)
wait $BACKEND_PID
wait $FRONTEND_PID
