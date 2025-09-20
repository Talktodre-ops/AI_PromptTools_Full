# PROMPTHERO

A full-stack application that helps users create and refine AI prompts using various modes and techniques, including specialized video prompts for AI video generation tools.

## Project Structure

```
PROMPTHERO/
├── frontend/          # Next.js frontend application
└── backend/          # FastAPI backend application
```

## Getting Started

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Features

- Multiple prompt engineering modes (basic, quick, deep, few-shot, chain-of-thought)
- Specialized video prompt generation for tools like Runway, Pika, and Sora
- Customizable tones and personas
- Various output formats (plain text, markdown, JSON)
- Real-time prompt generation and refinement