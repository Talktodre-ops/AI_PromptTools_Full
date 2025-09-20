# Gemini Agent Instructions for PROMPTHERO

This document outlines the development conventions and guidelines for the PROMPTHERO project. As the Gemini agent, I will adhere to these instructions when modifying the codebase.

## 1. Project Overview

PROMPTHERO is a full-stack application designed to help users create, refine, and manage AI prompts. It features a Next.js frontend and a FastAPI backend.

- **Frontend:** Provides the user interface for prompt creation, refinement, and viewing results.
- **Backend:** Handles the logic for interacting with AI models (e.g., Google Gemini) to process and generate prompts.

## 2. Core Technologies

When making changes, I will respect the existing technology stack and patterns.

### Frontend (Next.js)

- **Language:** TypeScript
- **Framework:** Next.js (App Router)
- **UI Components:** Shadcn/ui
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (`useState`, `useEffect`, `useContext`) and URL state (`useSearchParams`). State is persisted in `localStorage`.
- **Linting:** `npm run lint` (using Next.js's built-in ESLint configuration).

### Backend (FastAPI)

- **Language:** Python
- **Framework:** FastAPI
- **Dependencies:** Managed via `requirements.txt`. Key libraries include `fastapi`, `uvicorn`, `google-generativeai`, and `pydantic`.
- **Structure:** Code is organized into `routers`, `services`, and `models`. I will follow this pattern for new features.
- **Data Validation:** Pydantic models are used for request and response validation.

## 3. Development Workflow

### A. Analysis Phase

Before writing any code, I will first analyze the relevant files to understand the existing patterns, logic, and conventions. I will use `read_file`, `read_many_files`, and `glob` to gather context.

### B. Implementation Phase

- **Frontend:**
    - New components will be created in the `components/` directory.
    - UI components will be built using existing Shadcn/ui primitives.
    - Utility functions will be placed in `lib/utils.ts`.
    - API calls to the backend will be managed through `lib/api.ts`.
- **Backend:**
    - New API endpoints will be added to the appropriate file in the `routers/` directory.
    - Business logic will be encapsulated in the `services/` directory.
    - Data structures will be defined in the `models/` directory using Pydantic.

### C. Verification Phase

After making any changes, I will run the following checks:

1.  **Frontend Linting:** I will execute `npm run lint -- --fix` in the `frontend/` directory to ensure code quality and consistency.
2.  **Backend Analysis:** While no specific linter is defined, I will manually review my changes for style consistency (PEP 8) and correctness.
3.  **Testing:** I will look for and run any existing tests. If I add a new feature, I will create a corresponding test file.

## 4. Version Control

- I will write clear and concise commit messages, following the Conventional Commits specification (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).
- Before committing, I will use `git status` and `git diff` to review my changes.

## 5. Running the Application

To run the full stack for verification:

- **Backend:** `cd backend && uvicorn main:app --reload`
- **Frontend:** `cd frontend && npm run dev`

By following these guidelines, I will ensure that my contributions are consistent, maintainable, and aligned with the project's standards.
