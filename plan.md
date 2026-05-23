# VedaAI – Full Stack Engineering Assignment Guide

# Goal

Build a production-style AI Assessment Creator with:

* Clean frontend architecture
* Scalable backend system
* AI-powered question generation
* Real-time updates
* Structured output formatting
* Professional UI/UX

---

# What VedaAI Is Actually Evaluating

They want to check whether you understand:

* Full-stack architecture
* Queue systems & async workflows
* AI output structuring
* Real-time systems
* State management
* Production-ready thinking
* UI implementation quality

Most candidates will:

* Directly call OpenAI from frontend
* Render raw AI text
* Skip queues/websocket
* Ignore proper architecture

If you implement:

* BullMQ
* Redis
* Structured parsing
* WebSocket updates
* Proper PDF generation
* Good UX polish

…you instantly stand out.

---

# Recommended Tech Stack

## Frontend

* Next.js 15 (App Router)
* TypeScript
* Zustand
* TailwindCSS
* shadcn/ui
* socket.io-client
* react-hook-form
* zod
* react-pdf or pdf-lib

---

## Backend

* Node.js
* Express
* TypeScript
* MongoDB
* Redis
* BullMQ
* Socket.io
* OpenAI API

---

# Recommended Project Structure

# Frontend Structure

```bash
frontend/
│
├── app/
│   ├── create/
│   ├── assignment/[id]/
│   ├── api/
│   └── globals.css
│
├── components/
│   ├── forms/
│   ├── ui/
│   ├── question-paper/
│   ├── websocket/
│   └── pdf/
│
├── store/
│   ├── assignmentStore.ts
│   └── websocketStore.ts
│
├── lib/
│   ├── socket.ts
│   ├── api.ts
│   └── validators.ts
│
└── types/
```

---

# Backend Structure

```bash
backend/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── workers/
│   ├── queues/
│   ├── websocket/
│   ├── prompts/
│   ├── parsers/
│   ├── models/
│   ├── utils/
│   └── index.ts
│
├── redis/
├── docker-compose.yml
└── .env
```

---

# PHASE 1 — Project Setup

# Step 1 — Initialize Frontend

```bash
npx create-next-app@latest frontend
```

Select:

* TypeScript
* TailwindCSS
* App Router
* ESLint

---

# Step 2 — Install Frontend Dependencies

```bash
npm install zustand socket.io-client zod react-hook-form @hookform/resolvers axios lucide-react
```

Install shadcn:

```bash
npx shadcn@latest init
```

Add UI components:

```bash
npx shadcn@latest add button card input textarea badge dialog
```

---

# Step 3 — Initialize Backend

```bash
mkdir backend
cd backend
npm init -y
```

Install dependencies:

```bash
npm install express cors dotenv mongoose ioredis bullmq socket.io openai zod
```

Install dev dependencies:

```bash
npm install -D typescript ts-node-dev @types/node @types/express
```

Initialize TypeScript:

```bash
npx tsc --init
```

---

# Step 4 — Setup Docker

Create `docker-compose.yml`

```yaml
version: '3'

services:
  mongodb:
    image: mongo
    ports:
      - "27017:27017"

  redis:
    image: redis
    ports:
      - "6379:6379"
```

Run:

```bash
docker compose up -d
```

This gives:

* MongoDB
* Redis

---

# PHASE 2 — Database Design

# Step 5 — Create Assignment Schema

```ts
Assignment {
  title
  dueDate
  instructions
  questionTypes
  totalQuestions
  totalMarks
  status
  generatedPaper
}
```

---

# Step 6 — Create Structured Question Schema

Never store raw AI output.

Use structured JSON:

```json
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "question": "Explain Newton's First Law.",
          "difficulty": "easy",
          "marks": 2
        }
      ]
    }
  ]
}
```

This is extremely important.

---

# PHASE 3 — Frontend Development

# Step 7 — Build Assignment Form

Use:

* react-hook-form
* zod validation

Fields:

* Assignment title
* Due date
* Question types
* Number of questions
* Total marks
* Additional instructions
* Optional PDF upload

---

# Validation Requirements

Validate:

* Empty values
* Negative values
* Invalid dates
* Invalid marks

---

# Important UI Tip

Do NOT blindly copy Figma.

Improve:

* spacing
* typography
* loading states
* hover effects
* transitions

This creates a polished product feel.

---

# Step 8 — Zustand State Management

Store:

* assignment data
* generation status
* websocket progress
* generated paper

Example:

```ts
{
  assignment,
  isGenerating,
  progress,
  generatedPaper
}
```

---

# PHASE 4 — Backend Architecture

# Step 9 — Create API Endpoint

```http
POST /assignments/create
```

Flow:

1. Validate request
2. Save assignment
3. Add BullMQ job
4. Return assignmentId

Do NOT generate AI response directly here.

---

# Step 10 — Setup BullMQ Queue

Create queue:

```ts
question-generation.queue.ts
```

Add jobs:

```ts
await queue.add("generate-paper", {
  assignmentId
})
```

---

# Step 11 — Create Worker

Worker Flow:

1. Fetch assignment
2. Build prompt
3. Call OpenAI
4. Parse response
5. Store structured result
6. Update status
7. Emit websocket event

This is one of the most important evaluation points.

---

# PHASE 5 — AI System

# Step 12 — Prompt Engineering

Bad Prompt:

```txt
Generate question paper
```

Good Prompt:

```txt
Generate a structured assessment paper.

Rules:
- Create sections
- Add difficulty
- Add marks
- Return STRICT JSON

JSON FORMAT:
{
  "sections": []
}
```

---

# Step 13 — Force Structured JSON Output

Use:

```ts
response_format: { type: "json_object" }
```

OR validate using zod schema.

---

# Step 14 — Create AI Parser Layer

Create:

```bash
parsers/questionPaper.parser.ts
```

Validate:

* marks exist
* difficulty valid
* sections valid
* question text exists

Never trust raw AI response.

This is a high-signal engineering decision.

---

# PHASE 6 — WebSocket System

# Step 15 — Setup Socket.io

Backend:

```ts
io.emit(`assignment:${id}`, {
  status: "completed"
})
```

Frontend:

```ts
socket.on(...)
```

---

# Step 16 — Real-Time UX

Show:

* queued
* generating
* formatting
* completed

This gives a production-grade feel.

---

# PHASE 7 — Output Page

# Step 17 — Build Professional Question Paper UI

The output should look like a real exam paper.

Include:

* centered title
* student info section
* section grouping
* aligned marks
* difficulty badges

---

# Suggested Layout

```txt
--------------------------------
         MID TERM TEST
--------------------------------

Name: ____________

Roll No: __________

--------------------------------
SECTION A
Attempt all questions
--------------------------------

Q1 ...
[Easy] 2 Marks
```

---

# Step 18 — Difficulty Badges

Use colors:

* Easy → Green
* Medium → Yellow
* Hard → Red

This adds strong visual polish.

---

# PHASE 8 — PDF Export

# Step 19 — Generate Proper PDF

Avoid:

```js
window.print()
```

Use:

* react-pdf
  OR
* pdf-lib

Generate a properly formatted PDF.

---

# PHASE 9 — High-Signal Bonus Features

# Bonus 1 — Regenerate Specific Section

Allow regenerating:

* one section
* one question

Very impressive feature.

---

# Bonus 2 — Difficulty Distribution

Example:

* 40% easy
* 40% medium
* 20% hard

Shows intelligent AI control.

---

# Bonus 3 — Redis Caching

Cache:

* prompts
* generated papers

Mention this in README.

---

# Bonus 4 — PDF Upload Context

If user uploads PDF:

1. Extract text
2. Use it as AI context

Use:

```bash
npm install pdf-parse
```

Very high-signal feature.

---

# PHASE 10 — Deployment

# Step 20 — Deploy Frontend

Recommended:

* Vercel

---

# Step 21 — Deploy Backend

Recommended:

* Railway
* Render

---

# Step 22 — Use MongoDB Atlas

Use cloud MongoDB database.

---

# Step 23 — Use Redis Cloud

Use hosted Redis instance.

---

# README Structure

# 1. Project Overview

Explain:

* purpose
* architecture
* AI flow

---

# 2. Architecture Diagram

Example:

```txt
Frontend
   ↓
Express API
   ↓
BullMQ Queue
   ↓
Worker
   ↓
OpenAI
   ↓
MongoDB
   ↓
WebSocket Update
```

---

# 3. Why BullMQ?

Explain:

* async processing
* retries
* scalability
* background workers

---

# 4. AI Flow

Explain:

* prompt creation
* JSON parsing
* validation
* structured storage

---

# 5. Engineering Decisions

Examples:

* Zustand for simplicity
* BullMQ for scalability
* Socket.io for realtime updates

This makes you look experienced.

---

# Important Engineering Decisions

# 1. Never Render Raw AI

Always:

* parse
* validate
* structure

---

# 2. Queue-Based Architecture

One of the most important requirements.

---

# 3. Proper Real-Time UX

WebSocket updates matter.

---

# 4. Clean Component Architecture

Avoid giant files.

---

# 5. Structured Database Design

Do not store raw AI blobs.

---

# Things To Avoid

Avoid:

* direct frontend OpenAI calls
* raw AI text rendering
* ugly PDFs
* fake queue implementation
* poor formatting
* giant files

---

# Suggested Timeline

# Day 1

* setup
* frontend form
* backend APIs
* MongoDB
* BullMQ

---

# Day 2

* AI generation
* parser
* websocket
* output page

---

# Day 3

* PDF export
* deployment
* README
* bug fixes
* polish

---

# Final Submission Checklist

* [ ] Figma accurately implemented
* [ ] Mobile responsive
* [ ] Queue architecture works
* [ ] WebSocket updates work
* [ ] Structured AI output
* [ ] MongoDB stores papers
* [ ] Redis + BullMQ properly used
* [ ] PDF export works
* [ ] README polished
* [ ] Deployment working
* [ ] Clean GitHub commits

---

# Features Most Likely To Get You Selected

If you properly implement these 5 things:

1. BullMQ worker architecture
2. Structured AI parsing
3. Beautiful output page
4. Real-time websocket updates
5. Proper PDF export

…you’ll already be ahead of most candidates.

# How To Stand Out From Other Candidates

Most candidates will treat this assignment like a simple feature implementation task.

You should treat it like a mini production-grade system.

The reviewers are not only checking:

* whether the app works

They are checking:

* whether you think like a real engineer
* whether you understand scalable systems
* whether you can build production-quality software
* whether your implementation feels polished and reliable

---

# Where Most Candidates Will Fail

Most submissions will likely:

* directly call OpenAI from frontend
* render raw AI responses
* skip proper architecture
* avoid queues
* avoid websocket systems
* have poor UI polish
* have weak README documentation
* ignore engineering tradeoffs

Even if their app technically works, it may still feel junior.

---

# How You Can Stand Out

Your goal should be to create the feeling:

> “This person thinks like an engineer, not just a coder.”

You create this feeling through:

* architecture
* reliability
* UI polish
* clean UX
* scalability thinking
* good engineering decisions

---

# 1. Structured AI System (Very Important)

Most candidates will do:

```ts id="j8hnn3"
const response = await openai.chat.completions.create(...)
return response
```

And directly render the AI response.

You should instead implement:

```txt id="0ynmga"
Prompt
   ↓
AI Generation
   ↓
JSON Parsing
   ↓
Validation Layer
   ↓
Structured Database Storage
   ↓
UI Renderer
```

This immediately signals:

* production thinking
* backend maturity
* reliability mindset

This alone can separate you from many candidates.

---

# 2. Proper BullMQ + Worker Architecture

Most candidates may fake async systems or directly process requests.

You should implement a real async architecture:

```txt id="vjlwmx"
Frontend
   ↓
Express API
   ↓
BullMQ Queue
   ↓
Worker
   ↓
AI Generation
   ↓
MongoDB
   ↓
WebSocket Event
```

This feels like real-world backend engineering.

Huge signal.

---

# 3. Real-Time Progress Updates

Most apps will:

* show a loading spinner forever

Your app should instead show real progress:

```txt id="t2v91l"
Queued...
Generating Questions...
Structuring Paper...
Generating PDF...
Completed
```

This creates a production-grade experience.

Reviewers love this.

---

# 4. Beautiful Output Paper UI

This matters much more than people think.

Most candidates will:

* show ugly cards
* dump text blocks
* have poor spacing

You should make the paper feel like:

* a real exam paper
* professionally formatted
* highly readable

Use:

* proper spacing
* typography hierarchy
* aligned marks
* section grouping
* difficulty badges

This instantly improves perceived quality.

---

# 5. Proper PDF Export

Most candidates will skip PDF generation.

If your app can generate:

* clean printable PDFs
* properly formatted sections
* aligned question layouts

…it instantly feels complete and professional.

Avoid:

* browser print hacks
* poorly formatted PDFs

Use:

* react-pdf
  OR
* pdf-lib

---

# 6. Strong README Documentation

README quality is massively underrated.

Most candidates only include:

```md id="5kmz7z"
npm install
npm run dev
```

You should include:

* architecture diagrams
* AI flow explanation
* engineering decisions
* tradeoffs
* scalability reasoning
* queue architecture explanation

This makes reviewers think:

> “This person understands systems.”

---

# 7. Small UX Details

Small UX improvements create huge perception differences.

Examples:

* skeleton loaders
* smooth transitions
* empty states
* progress indicators
* hover effects
* responsive layouts
* difficulty badges
* polished typography

This creates:

* premium product feel
* attention to detail

---

# 8. Professional GitHub Commits

Avoid commits like:

```txt id="qwbk36"
final
done
fix
```

Use professional commits:

```txt id="s0t8fx"
feat: setup BullMQ worker pipeline
feat: implement structured AI parser
feat: add realtime websocket updates
fix: handle invalid AI JSON response
```

This subtly signals professionalism.

---

# 9. Explain Engineering Decisions

This is one of the highest-signal things you can do.

In your README explain:

* why queues are useful
* why parsing matters
* why websocket improves UX
* why Redis caching helps
* why structured schemas matter

This makes reviewers think:

> “This candidate understands tradeoffs and system design.”

---

# 10. Add One “WOW” Feature

You only need ONE memorable feature.

Examples:

* regenerate single section
* regenerate one question
* AI difficulty balancing
* upload PDF syllabus as context
* streaming generation
* downloadable branded exam paper
* teacher presets

One polished extra feature can massively differentiate your project.

---

# The Psychology Behind Selection

Reviewers may go through:

* 50+
* 100+
* even 200+ submissions

Most projects will blur together.

You need moments where reviewers pause and think:

> “Oh, this one feels different.”

Those moments come from:

* strong architecture
* polished UI
* thoughtful engineering
* smooth UX
* reliability

NOT from adding random features.

---

# Highest Signal Features

# Tier 1 (Most Important)

* BullMQ worker architecture
* Structured AI parsing
* Realtime websocket updates
* Clean output page
* Professional UI

---

# Tier 2

* PDF export
* Redis caching
* Strong README
* Responsive design

---

# Tier 3

* Extra animations
* Fancy visuals
* Additional AI features

---

# Important Mindset Shift

Do NOT try to build:

> “the app with the most features”

Instead build:

> “the most thoughtfully engineered solution”

That is what gets shortlisted.

---

# Final Goal

Your goal should be that the reviewer feels:

> “This candidate already thinks like a production engineer.”

That feeling comes from:

* clean architecture
* reliability
* structured systems
* polished UX
* thoughtful engineering decisions
