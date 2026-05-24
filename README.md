# VedaAI – AI Assessment Creator

A full-stack AI-powered assessment creator that lets teachers generate structured, university-style exam papers in seconds. Built with an event-driven queue architecture for non-blocking AI generation and real-time progress updates.

---

## System Architecture

Rather than calling OpenAI directly from a request handler, generation is delegated to a background worker so the HTTP layer stays fast and the UI receives live progress updates.

```
        +----------------------------+
        |   Frontend (Next.js 16)    |
        +-------------+--------------+
                      | POST /assignments/create
                      v
        +----------------------------+
        |    Express 5 API Server    | <---+
        +-------------+--------------+     |
                      |                    |
         Add Job      |                    | Socket.io
                      v                    | Progress Events
        +----------------------------+     |
        |  BullMQ Queue (Redis)      |     |
        +-------------+--------------+     |
                      |                    |
         Pulls Job    |                    |
                      v                    |
        +----------------------------+     |
        |  Async Background Worker   |-----+
        +-------------+--------------+
                      |
        +-------------+-------------+
        |                           |
        v                           v
+---------------+           +---------------+
|  OpenAI API   |           |  MongoDB       |
|  (JSON Mode + |           |  (Assignment   |
|  Zod Validation)|         |   Storage)     |
+---------------+           +---------------+
```

### Key Engineering Decisions

1. **BullMQ Queue** — AI generation is unpredictable in duration. The API returns `202 Accepted` with an `assignmentId` immediately and delegates work to a BullMQ worker backed by Redis, keeping the HTTP layer non-blocking.

2. **Socket.io + Polling Fallback** — The worker emits progress events (`queued → generating → formatting → completed`) via Socket.io. A polling fallback runs every 3 seconds on the client to catch events missed due to race conditions on the deployed environment.

3. **Structured AI Output + Zod Validation** — OpenAI is called with `response_format: { type: "json_object" }`. The raw response is parsed and validated against a Zod schema before being written to MongoDB. Raw LLM output is never stored or rendered directly.

4. **Zustand State Management** — Global state (assignment list, form draft, generation progress) is managed with Zustand, keeping components decoupled from each other.

5. **React-PDF Renderer** — PDFs are generated using `@react-pdf/renderer` producing real, searchable, properly paginated output with correct page breaks — not an HTML screenshot.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| State | Zustand, React Hook Form, Zod |
| Drag and Drop | dnd-kit (core + sortable) |
| PDF | @react-pdf/renderer |
| Backend | Express 5, Node.js, TypeScript (ESM) |
| Queue | BullMQ + ioredis |
| Database | MongoDB + Mongoose |
| WebSockets | Socket.io |
| AI | OpenAI SDK (gpt-4o-mini, JSON mode) |
| Validation | Zod (shared on backend) |

---

## Features

### Assignment Creation
- Two-step form: details then review
- Dynamic question config rows (type, count, marks per question)
- File upload with drag and drop
- Due date calendar picker
- Voice input via Web Speech API for title and additional info fields (free, no external service)
- Client-side validation with React Hook Form and Zod

### AI Generation
- Background BullMQ worker calls OpenAI with a structured prompt
- Questions grouped into sections by type
- Each question carries difficulty (easy / medium / hard) and marks
- Zod validates the JSON response before saving

### Real-time Progress
- Socket.io events emitted at each status transition
- Polling fallback every 3 seconds catches events missed before the client connected
- Animated progress bar on the assignment detail page

### Output Editor
- Split editor and live PDF preview panel
- Drag and drop reordering of sections and questions
- Inline section editing (title, sub-heading, instruction)
- Customisable paper metadata (school name, subject, class, duration, instructions)
- Answer key toggle (printed on a separate page)
- Regenerate entire paper
- Regenerate a single section without touching the rest

### PDF Export
- Real paginated PDF via `@react-pdf/renderer` (not a screenshot)
- Student info lines (Name, Roll Number, Class)
- Two-column MCQ option layout
- Marks and difficulty tag per question
- Answer key on a dedicated final page
- One-click download

---

## Project Structure

```
vedaai-task/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                   # Home — assignment list, search, filter
│   │   ├── create/page.tsx            # Two-step creation form
│   │   └── assignment/[id]/page.tsx   # Detail page — progress + output editor
│   ├── components/
│   │   ├── forms/
│   │   │   ├── AssignmentForm.tsx     # Step 1 — details form
│   │   │   └── ReviewForm.tsx         # Step 2 — review and submit
│   │   ├── paper/
│   │   │   ├── PaperEditorView.tsx    # Split editor/preview container
│   │   │   ├── EditorPanel.tsx        # Left panel — metadata + DnD sections
│   │   │   ├── DraggableSection.tsx   # Section card with inline edit + regenerate
│   │   │   ├── DraggableQuestion.tsx  # Question card
│   │   │   ├── PDFPreview.tsx         # Client-only PDFViewer wrapper
│   │   │   ├── PaperPDF.tsx           # react-pdf Document definition
│   │   │   └── DownloadButton.tsx     # Lazy PDF generation on click
│   │   └── ui/                        # shadcn/ui primitives + MicButton
│   ├── hooks/
│   │   └── useSpeechRecognition.ts    # Web Speech API hook
│   ├── lib/
│   │   └── api.ts                     # Axios client + typed API functions
│   └── store/
│       └── assignmentStore.ts         # Zustand global store
│
├── backend/
│   └── src/
│       ├── index.ts                   # Express app, CORS, Socket.io init
│       ├── controllers/
│       │   └── assignment.controller.ts
│       ├── routes/
│       │   └── assignment.routes.ts
│       ├── models/
│       │   └── Assignment.model.ts    # Mongoose schema
│       ├── workers/
│       │   └── generation.worker.ts  # BullMQ worker — full paper generation
│       └── lib/
│           ├── openai.ts              # OpenAI client + section regeneration helper
│           ├── queue.ts               # BullMQ queue instance
│           ├── redis.ts               # ioredis connection
│           ├── socket.ts              # Socket.io singleton
│           ├── db.ts                  # Mongoose connect
│           ├── upload.ts              # Multer disk storage
│           └── zod-schemas.ts         # Shared Zod schemas
│
├── docker-compose.yml                 # MongoDB + Redis containers
└── README.md
```

---

## API Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/api/assignments` | List all assignments, sorted by date |
| GET | `/api/assignments/:id` | Get single assignment |
| POST | `/api/assignments/create` | Create assignment, enqueue generation job |
| POST | `/api/assignments/:id/regenerate` | Reset and re-queue full paper generation |
| POST | `/api/assignments/:id/sections/:index/regenerate` | Regenerate a single section (synchronous) |
| DELETE | `/api/assignments/:id` | Delete assignment |

---

## Running Locally

### Prerequisites
- Node.js v18+
- Docker Desktop

### 1. Start Infrastructure

```bash
docker compose up -d
```

Starts MongoDB on `localhost:27017` and Redis on `localhost:6379`.

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key_here
```

```bash
npm start
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

| Service | Platform |
| :--- | :--- |
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Redis | Upstash |

Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` on Vercel to your Render backend URL. Add all backend environment variables in the Render dashboard.
