# VedaAI – Full Stack AI Assessment Creator

VedaAI is a production-grade, full-stack AI Assessment Creator designed to generate structured, university-style exam papers using asynchronous background queuing, real-time WebSocket progress updates, and robust structured AI parsing layers.

---

## 🏗️ System Architecture

Rather than calling AI APIs directly from the frontend or block-waiting on long-running HTTP requests, VedaAI implements a **decoupled, event-driven queue architecture**:

```
        +----------------------------+
        |   Frontend (Next.js 15)    |
        +-------------+--------------+
                      | POST /assignments/create
                      v
        +----------------------------+
        |    Express API Server      | <---+
        +-------------+--------------+     |
                      |                    |
         Add Job      |                    | WebSocket
                      v                    | Progress
        +----------------------------+     | Updates
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
|  OpenAI API   |           |  MongoDB      |
|  (Structured  |           |  (Structured  |
|   JSON Mode)  |           |   Paper DB)   |
+---------------+           +---------------+
```

### 🧠 Core Engineering Decisions

1. **BullMQ & Redis Queueing**: AI generation is an unpredictable, time-intensive process. A synchronous HTTP request will timeout or freeze the user interface. We immediately return a `202 Accepted` status along with a unique `assignmentId` and delegate the generation task to a BullMQ queue backed by Redis.
2. **WebSocket Progress Updates**: The worker publishes progress updates (`Queued` ➜ `Generating` ➜ `Formatting` ➜ `Completed`) via **Socket.io** directly to the client. This provides an active, premium user experience instead of a static loader.
3. **Structured AI Parsing & Zod Validation**: We never store or render raw markdown/text returned by the AI. We force JSON output using OpenAI's `response_format` and run the resulting object through a rigorous schema-validation layer using **Zod** on the backend before writing it to MongoDB.
4. **Decoupled State Management**: The client relies on **Zustand** to cleanly manage global states (assignments, WebSocket connections, active progress steps) separate from component rendering logic.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router), TS | Modern React framework with Tailwind CSS v4, Lucide Icons, and shadcn/ui. |
| **State & UI** | Zustand, React Hook Form, Zod | Lightweight state management and robust client-side validation. |
| **Backend API** | Express, Node.js, TypeScript | Clean routing, request validation, and event emitter integrations. |
| **Task Queue** | BullMQ, Redis | High-performance background task executor and job tracking system. |
| **Database** | MongoDB, Mongoose | Flexible document storage for multi-section exams and metadata. |
| **WebSockets** | Socket.io | Bidirectional real-time client-worker event system. |
| **AI System** | OpenAI SDK, Zod Schema | Prompt engineering + JSON verification layers. |

---

## 📂 Project Structure

```bash
vedaai-task/
│
├── frontend/             # Next.js Web Client
│   ├── app/              # App router (forms, layouts, status page)
│   ├── components/       # Component library (UI elements & layouts)
│   └── store/            # Zustand global stores
│
├── backend/              # Node.js API Service & Workers
│   ├── src/
│   │   ├── controllers/  # API entrypoints
│   │   ├── models/       # Mongoose schemas
│   │   ├── queues/       # BullMQ queue configurations
│   │   ├── workers/      # Background question paper worker
│   │   ├── websocket/    # Socket.io connection logic
│   │   └── index.ts      # Server entry point
│   ├── tsconfig.json     # Compiler configuration
│   └── package.json      # Node scripts & packages
│
├── docker-compose.yml    # Local infrastructure (MongoDB & Redis)
├── .gitignore            # Git ignore exclusions
└── README.md             # This document
```

---

## ⚙️ Running Locally

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **Docker Desktop**

---

### 2. Start Services
Launch local database and redis containers using Docker Compose:
```bash
docker compose up -d
```
*Creates MongoDB on `localhost:27017` and Redis on `localhost:6379`.*

---

### 3. Setup Backend
1. Open a new terminal and navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/vedaai
   REDIS_URL=redis://localhost:6379
   OPENAI_API_KEY=your_openai_api_key_here
   ```
3. Start the backend development server (hot-reloading):
   ```bash
   npm run dev
   ```

---

### 4. Setup Frontend
1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env.local` file in `frontend/` folder:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WS_URL=http://localhost:5000
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the web client at [http://localhost:3000](http://localhost:3000).
