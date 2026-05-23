# VedaAI – AI Assessment Creator (Frontend)

VedaAI is a production-grade web application built to generate, visualize, and export structured AI-powered question papers. It provides an intuitive user interface with real-time tracking of paper generation progress via WebSockets, interactive form validation, and professional PDF export.

## 🚀 Key Features

* **Interactive Form Creation**: Dynamic inputs for assessments, including instructions, question counts, marks, difficulty control, and file uploads.
* **Robust Client-Side Validation**: Powered by `react-hook-form` and `zod` for real-time validation and error handling.
* **Real-time Generation Progress**: Direct integration with a WebSocket server to view generation status (`Queued` ➜ `Generating` ➜ `Formatting` ➜ `Completed`).
* **Beautiful Exam-Style Rendering**: Styled to resemble a real school or university exam paper with proper sections, instructions, marks alignment, and difficulty-colored badges.
* **High-Quality PDF Export**: Download capability for question papers using robust client-side PDF rendering.
* **Clean State Management**: Global states for WebSocket status, generation progress, and generated papers handled via `Zustand`.

---

## 🛠️ Technology Stack

* **Core Framework**: Next.js 15 (App Router)
* **Language**: TypeScript
* **State Management**: Zustand
* **Styling**: Tailwind CSS v4
* **UI Components**: shadcn/ui & Lucide React
* **Forms & Validation**: React Hook Form, Zod, and `@hookform/resolvers`
* **Real-time Communication**: socket.io-client
* **HTTP Client**: Axios

---

## 📂 Project Structure

```bash
frontend/
│
├── app/
│   ├── layout.tsx         # Root layout (Metadata, Fonts, Providers)
│   ├── page.tsx           # Dashboard / Welcome page
│   ├── globals.css        # Tailwind v4 globals & custom themes
│   ├── create/            # Assessment creation form page
│   └── assignment/
│       └── [id]/          # Interactive question paper viewer & PDF exporter
│
├── components/
│   ├── ui/                # shadcn primitives (Button, Card, Input, Badges, etc.)
│   ├── forms/             # Assessment configuration form component
│   ├── question-paper/    # Exam layout viewer component
│   └── websocket/         # Connection status & real-time loader component
│
├── store/
│   ├── assignmentStore.ts # Assessment and generated paper state
│   └── websocketStore.ts  # Real-time WebSocket connection state
│
├── lib/
│   ├── api.ts             # Axios instance & API route wrappers
│   ├── socket.ts          # Socket.io connection manager
│   └── utils.ts           # Tailwind-merge & clsx helpers
│
└── types/                 # Shared TypeScript types & interfaces
```

---

## 💻 Getting Started

### Prerequisites

Ensure you have **Node.js (v18.x or later)** and **npm** installed on your system.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To launch the local development server:

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Development Commands

- `npm run dev` – Starts the development server.
- `npm run build` – Builds the application for production deployment.
- `npm run start` – Starts the built Next.js application in production mode.
- `npm run lint` – Runs ESLint check to identify potential issues in code.
