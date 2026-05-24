# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

VedaAI is a full-stack AI Assessment Creator that generates structured, university-style exam papers. The intended architecture is a **decoupled, event-driven queue system** with real-time progress tracking:

- **Frontend** (Next.js 16 + React 19): Multi-step form UI with real-time generation progress via Socket.io
- **Backend** (Express 5 + Node.js): REST API skeleton — routes, queue workers, and OpenAI integration are not yet implemented
- **Queue System** (BullMQ + Redis): Planned to decouple AI generation from HTTP requests
- **Database** (MongoDB + Mongoose): Schema and model defined; not yet wired to routes
- **AI Integration** (OpenAI + Zod): Planned structured JSON output with validation

---

## Commands

### Backend

The backend has no `dev` script in `package.json`. Run it with ts-node-dev directly:

```bash
cd backend
npm install
npx ts-node-dev --respawn --transpile-only src/index.ts
```

Build TypeScript:
```bash
cd backend
npx tsc
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # Next.js dev server on port 3000
npm run build
npm run start
npm run lint     # ESLint
```

### Infrastructure

```bash
# From project root — starts MongoDB (27017) and Redis (6379)
docker compose up -d
docker compose down
docker compose logs -f
```

### Environment Setup

`backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_api_key_here
```

`frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

---

## Architecture

### Backend State

`backend/src/index.ts` is a minimal skeleton — only one GET `/` route. The `Assignment.model.ts` schema is fully defined but nothing connects it to routes yet. BullMQ, Socket.io, and OpenAI are installed but unimplemented.

The intended flow:
```
POST /api/assignments/create → 202 + assignmentId
  → BullMQ job enqueued
  → Worker calls OpenAI (structured JSON + Zod validation)
  → Updates MongoDB status (queued → generating → formatting → completed/failed)
  → Emits Socket.io events: progress:assignment_<id>
```

### Frontend State Management

**Zustand store** at `frontend/store/assignmentStore.ts` manages:
- Assignment list (`IAssignment[]`)
- Multi-step form (`formStep: 1|2`, `formDraft: IAssignmentForm`)
- Real-time generation state (`isGenerating`, `generationProgress 0-100`, `generationStatusText`, `activeGeneratedPaper`)

Key action: `setGeneratingState(isGenerating, progress, statusText, paper?)` — called by Socket.io listener in ReviewForm.

### API Layer

**`frontend/lib/api.ts`** — Axios client with `baseURL: $NEXT_PUBLIC_API_URL/api`. All API functions are typed against `IAssignment` from the store. `createAssignment()` sends multipart/form-data.

### Database Schema

**`backend/src/models/Assignment.model.ts`** — Mongoose schema with:
- `status` enum: `queued | generating | formatting | completed | failed`
- `questionConfigs[]`: dynamic array of `{ questionType, noOfQuestions, marksPerQuestion }`
- `generatedPaper`: nested `{ sections: [{ title, instruction, questions: [{ question, options?, answer?, difficulty, marks }] }] }`
- `uploadedFile`: stores `{ filename, originalName, mimeType, size, path }` — file processing not yet implemented

### Form Flow

Two-step creation at `frontend/app/create/page.tsx`:
1. `AssignmentForm` — title, file upload, due date, dynamic question config rows, additional info; validated with React Hook Form + Zod
2. `ReviewForm` — confirms data, submits to API, listens to WebSocket progress, displays generated paper

### UI

- **shadcn/ui** primitives in `frontend/components/ui/`
- **Tailwind CSS v4** + `class-variance-authority` for variants
- `DashboardLayout` wraps all pages with sidebar + mobile-responsive menu
- `framer-motion` for animations

### TypeScript Config

Backend: `target: esnext`, `module: nodenext`, `"type": "module"` in package.json — use ES module import syntax.

Frontend: Standard Next.js bundler config, path alias `@/*` → root.
