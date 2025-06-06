# AI Prompt Tools Setup Guide

This guide will help you set up and run the AI Prompt Tools application.

## Prerequisites

- Python 3.8+ for the backend
- Node.js 18+ for the frontend
- Google Gemini API key (get one from https://ai.google.dev/)

## Setup Instructions

### 1. Backend Setup

1. Create a `.env` file in the `backend` directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Run the environment check:
   ```bash
   python check_env.py
   ```

4. Start the backend server:
   ```bash
   python run.py
   ```

   The backend will run on http://localhost:8000

### 2. Frontend Setup

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

   The frontend will run on http://localhost:3000

## Using the Quick Start Scripts

### Windows
Run `start.bat` to start both the backend and frontend servers.

### Linux/Mac
Run `./start.sh` to start both the backend and frontend servers.

## Troubleshooting

### "API Error: 404 - Not Found"
- Make sure the backend server is running at http://localhost:8000
- Check that you've set up the GEMINI_API_KEY in the .env file

### "Cannot connect to the backend API"
- Make sure the backend server is running
- Check for any console errors in the backend terminal

### Other Issues
- Check the browser console for frontend errors
- Check the backend terminal for Python errors 