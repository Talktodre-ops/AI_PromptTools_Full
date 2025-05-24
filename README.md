# AI Prompt Engineering Tool

A full-stack application that helps users create and refine AI prompts using various modes and techniques.

## Project Structure

```
AI_PromptTools_Full/
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
- Customizable tones and personas
- Various output formats (plain text, markdown, JSON)
- Real-time prompt generation and refinement