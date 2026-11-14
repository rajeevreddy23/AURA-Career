# 🚀 AURA Career & Learn: Full Project Stack & Technology Breakdown

A PDF document containing full architectural details, programming languages, framework stacks, and situational mappings has been generated and saved to your project repository:

📄 **PDF File Location:** [`AURA_Learn_Project_Stack_Details.pdf`](file:///C:/AuraLearn%20-%20Copy/AURA_Learn_Project_Stack_Details.pdf)

---

## 📊 Quick Summary of the Project Stack

```
+---------------------------------------------------------------------------------------------------+
|                                   AURA CAREER ARCHITECTURE STACK                                  |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ FRONTEND LAYER ] ----> Next.js 14 (App Router) + React 18 + TypeScript 5.5 + Tailwind CSS 3.4  |
|                           Framer Motion 11 + Monaco Editor + pdfjs-dist + Recharts + Zustand      |
|                                                                                                   |
|  [ BACKEND LAYER  ] ----> Python 3.11+ + FastAPI 0.115 + Uvicorn 0.30 + Celery + Redis            |
|                           PostgreSQL (SQLAlchemy 2.0 AsyncIO + AsyncPG) + Alembic 1.14            |
|                                                                                                   |
|  [ AI AGENT ENGINE] ----> Google Gemini 2.0 Flash + Groq API + OpenAI API + Custom Agent Framework|
|                           WebSockets (Real-time streaming Q&A)                                    |
|                                                                                                   |
|  [ IDENTITY & AUTH] ----> Firebase Admin SDK 6.6 + Firebase Client SDK + JWT (Python-JOSE)        |
|                                                                                                   |
|  [ INFRASTRUCTURE ] ----> Docker & Docker Compose + Vercel + Render + Sentry + Prometheus         |
+---------------------------------------------------------------------------------------------------+
```

---

## 1. Programming Languages & Situational Usage

| Language | Scope / Version | Primary Purpose in Application | Exact Situation / Trigger Context |
| :--- | :--- | :--- | :--- |
| **TypeScript** | v5.5 (Frontend & Next.js API) | Core language for 100% of frontend React UI (`src/`), custom hooks, contexts, Zustand stores, and Next.js serverless route handlers. | Executed during client-side rendering, user UI interactions, client PDF parsing, and Next.js serverless endpoint execution. |
| **Python** | v3.11+ (Backend Microservices) | Core language for FastAPI backend (`backend/app/`), multi-agent AI framework, async PostgreSQL ORM models, and Celery background workers. | Triggered when processing deep AI agent workflows, executing database transactions, managing WebSockets, and running background jobs. |
| **JavaScript** | ES2023 / Node.js | Application configuration scripts (`next.config.js`, `postcss.config.js`), build tooling, and Node server runtime underlying Next.js. | Executed during application build phase (`npm run build`), SSR runtime execution, and development server execution (`npm run dev`). |
| **HTML5 & CSS3** | HTML5, CSS3, Tailwind 3.4 | Structural markup and responsive visual design (`src/styles/`). Custom HSL visual tokens, CSS animations, and dark glassmorphism. | Rendered continuously by the web browser DOM engine across all application pages (Classroom, Resume Hub, Teacher Switcher). |
| **SQL** | PostgreSQL 15 Dialect | Relational database schema definitions, structured data persistence, indexed queries, and migration DDL scripts. | Executed during user authentication, saving course progress, logging ATS analysis history, and querying course catalogs. |

---

## 2. Frontend Technology Stack

* **Next.js 14.2 (App Router)** (`src/app/`): Serves server components, layout nesting, page routing (`/classroom`, `/resume-hub`, `/select-teacher`), and edge API handlers.
* **React 18.3 & React DOM** (`src/components/`): Manages UI view state, dynamic re-rendering, virtual DOM diffing, and component lifecycles.
* **Tailwind CSS 3.4 & Vanilla CSS** (`tailwind.config.ts`, `src/styles/`): Provides responsive utility styling, dark mode glassmorphism themes, and visual tokens.
* **Framer Motion 11.0** (`src/components/classroom/`): Powers breathing 3D robot avatar animations, visual glowing pulses, entrance modals, and animated score gauges.
* **Monaco Editor (`@monaco-editor/react` 4.6)**: Renders the browser-based code sandbox in the classroom blackboard for writing, editing, and running code snippets.
* **`pdfjs-dist` 6.2 & `mammoth` 1.12** (`src/lib/pdfParser.ts`): Parses uploaded PDF and Word (`.docx`) resumes directly in the browser to extract text before sending to the ATS engine.
* **Chart.js 4.4, React-Chartjs-2 5.2 & Recharts 2.12** (`src/components/resume/`): Visualizes ATS match score gauges, 5-criteria horizontal progress bars, and skill match radars.
* **Zustand 5.0** (`src/contexts/`): Global client state store managing active slide index, selected AI teacher persona, code sandbox buffer, and user preferences.
* **Radix UI & Headless UI** (`src/components/`): Accessible UI primitives for modal overlays (Teacher Switcher, Exit Modal), accordions, popovers, select dropdowns, and toast notifications.
* **`react-markdown` 9.0 & `react-syntax-highlighter` 15.5**: Formats markdown explanations, LaTeX math, and syntax-highlighted code blocks returned by the AI Professor in live tutoring chat.
* **`react-confetti` 6.1**: Triggers celebratory particle animations upon course module completion, quiz victory, or reaching ATS target score.

---

## 3. Backend Technology Stack

* **FastAPI 0.115** (`backend/app/main.py`): High-performance async Python web framework hosting REST endpoints (`/api/v1/`), multi-agent execution routes, and WebSocket endpoints.
* **Uvicorn 0.30 & Gunicorn 23.0** (`backend/Dockerfile`): Production ASGI web server running FastAPI with asynchronous worker processes.
* **Google Gemini API (2.0 Flash)** (`backend/app/agents/`, `src/app/api/`): Primary LLM engine generating multi-slide lesson content, analyzing resumes against job requirements, and running interactive tutoring dialogs.
* **Groq API 1.6** (`backend/app/agents/`): Ultra-low latency LLM inference provider used as primary/secondary agent engine for instant conversational speech/chat responses.
* **OpenAI API 2.52** (`backend/app/agents/`): Backup multi-modal LLM engine for specialized code evaluation and secondary reasoning.
* **PostgreSQL + AsyncPG + SQLAlchemy 2.0** (`backend/app/models/`, `backend/app/core/`): Relational database, async driver, and ORM handling persistent storage for users, courses, resume analyses, and quiz scores.
* **Alembic 1.14** (`backend/alembic/`): Database schema migration management and version control.
* **Redis 5.2 (with Hiredis 5.2)** (`backend/app/core/redis.py`): In-memory cache and message queue broker for session caching, rate limiting, and background task execution.
* **Celery 5.4** (`backend/app/core/celery.py`): Asynchronous background task queue processing heavy computational jobs (deep ATS scoring, report generation).
* **Firebase Admin SDK 6.6 & Client SDK 10.12** (`backend/app/core/security.py`): Identity management framework handling user authentication, OAuth sign-in, token verification, and security rules (`firestore.rules`).
* **WebSockets 14.1** (`backend/app/api/websocket_routes.py`): Full-duplex real-time channel between frontend live classroom UI and backend AI agents for live voice & text streaming.
* **Stripe API 11.0** (`backend/app/services/stripe.py`): Manages user subscription tiers, premium checkout, and payment webhooks.
* **Passlib + Bcrypt & Python-JOSE 3.3**: Security utilities for password hashing and JSON Web Token (JWT) verification.
* **Sentry SDK 2.17 & Prometheus FastAPI Instrumentator 7.0**: Backend error tracking (Sentry) and real-time performance telemetry metrics (Prometheus).

---

## 4. DevOps, Infrastructure & Deployment

* **Docker & Docker Compose** (`Dockerfile`, `docker-compose.yml`): Containerizes Next.js frontend, Python FastAPI backend, PostgreSQL database, and Redis cache.
* **Vercel** (`vercel.json`, `.vercelignore`): Hosting platform for Next.js frontend with automated edge deployments and preview builds.
* **Render Platform** (`render.yaml`): Cloud deployment platform for Python FastAPI backend services and Celery background workers.
* **ESLint, Prettier & TypeScript** (`.eslintrc.json`, `tsconfig.json`): Automated code linting, type validation (`npm run typecheck`), and code formatting.

---

## 📄 Access Your Generated PDF

The complete PDF file with formatted tables, executive callout boxes, custom header/footer page numbering, and situation matrices is available at:

👉 [**Open AURA_Learn_Project_Stack_Details.pdf**](file:///C:/AuraLearn%20-%20Copy/AURA_Learn_Project_Stack_Details.pdf)
