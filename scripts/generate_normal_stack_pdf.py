import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NormalCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NormalCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NormalCanvas, self).showPage()
        super(NormalCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Simple clean line at top
        if self._pageNumber > 1:
            self.drawString(54, 11 * 72 - 36, "AURA Learn - Project Technology Stack & Architecture Guide")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Simple clean line at bottom
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 8.5 * 72 - 54, 45)
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 30, page_text)
        self.drawString(54, 30, "AURA Career & Learn Platform - Technology Stack Guide")
        self.restoreState()


def create_normal_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Normal clean document typography
    text_dark = colors.HexColor("#1E293B")
    heading_dark = colors.HexColor("#0F172A")
    accent_blue = colors.HexColor("#2563EB")
    subtext_color = colors.HexColor("#475569")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=heading_dark,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=subtext_color,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=heading_dark,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=accent_blue,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_dark,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    tbl_header = ParagraphStyle(
        'THeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=heading_dark
    )

    tbl_cell = ParagraphStyle(
        'TCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=text_dark
    )

    story = []

    # Title & Subtitle
    story.append(Paragraph("AURA Learn - Project Technology Stack Guide", title_style))
    story.append(Paragraph("Complete Technical Reference of Languages, Frameworks, Libraries & Runtime Situations", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0F172A"), spaceBefore=0, spaceAfter=10))

    # Executive Overview
    story.append(Paragraph("Executive Overview", h1_style))
    story.append(Paragraph(
        "AURA Learn (AURA Career) is a next-generation AI-powered interactive learning and career development platform. "
        "The application incorporates an AI Resume Analyzer & ATS Scanner, Live Multi-Slide Interactive Classroom, Dynamic AI Teacher Avatar "
        "and Persona Transformer, Browser Coding Sandbox, Technical Doubt Resolution Assistant, and AI Course Generator. "
        "This document provides a clean, standard technical reference breaking down every programming language, framework, database, "
        "and utility tool used in the project, detailing where each technology is located and the specific situation in which it is triggered.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # Section 1: Programming Languages
    story.append(Paragraph("1. Programming Languages & Situational Usage", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("<b>1. TypeScript (v5.5)</b>", h2_style))
    story.append(Paragraph("• <b>Scope & Location:</b> Frontend application codebase (`src/`), React components (`.tsx`), type interfaces (`src/types/`), custom hooks (`src/hooks/`), Zustand state stores, and Next.js serverless route handlers (`src/app/api/`).", bullet_style))
    story.append(Paragraph("• <b>Role:</b> Ensures end-to-end static type safety for API request payloads, prompt configurations, state mutations, and UI prop validation.", bullet_style))
    story.append(Paragraph("• <b>When & Where Used:</b> Executed continuously during client-side rendering, user interactive button clicks, form submissions, browser PDF parsing, and Next API endpoint execution.", bullet_style))

    story.append(Paragraph("<b>2. Python (v3.11+)</b>", h2_style))
    story.append(Paragraph("• <b>Scope & Location:</b> Backend microservice (`backend/app/`), multi-agent framework (`backend/app/agents/`), FastAPI endpoints (`backend/app/api/`), SQLAlchemy database models (`backend/app/models/`), and Celery workers.", bullet_style))
    story.append(Paragraph("• <b>Role:</b> Core language powering AI multi-agent orchestration, LLM prompt engineering, asynchronous database transactions, background task execution, and WebSocket streaming.", bullet_style))
    story.append(Paragraph("• <b>When & Where Used:</b> Triggered when processing deep AI agent requests, querying PostgreSQL database models, streaming AI Professor live responses, and running async Celery jobs.", bullet_style))

    story.append(Paragraph("<b>3. JavaScript (ES2023 / Node.js)</b>", h2_style))
    story.append(Paragraph("• <b>Scope & Location:</b> Root configuration files (`next.config.js`, `postcss.config.js`, `.eslintrc.json`), build scripts, and Next.js Node server runtime environment.", bullet_style))
    story.append(Paragraph("• <b>Role:</b> Executes web server initializations, SSR page pre-rendering, build optimization scripts, and CSS post-processing.", bullet_style))
    story.append(Paragraph("• <b>When & Where Used:</b> Triggered during development server execution (`npm run dev`), production builds (`npm run build`), and server-side rendering execution.", bullet_style))

    story.append(Paragraph("<b>4. HTML5 & CSS3 / Tailwind CSS (v3.4)</b>", h2_style))
    story.append(Paragraph("• <b>Scope & Location:</b> Layout markup structure and styling stylesheets (`src/styles/globals.css`, `src/styles/pdf-viewer.css`, `tailwind.config.ts`).", bullet_style))
    story.append(Paragraph("• <b>Role:</b> Defines responsive visual presentation, custom HSL color tokens, dark glassmorphism themes, keyframe animations, and flexible container grids.", bullet_style))
    story.append(Paragraph("• <b>When & Where Used:</b> Evaluated continuously by web browser DOM layout engines across all user-facing views.", bullet_style))

    story.append(Paragraph("<b>5. SQL (PostgreSQL Dialect)</b>", h2_style))
    story.append(Paragraph("• <b>Scope & Location:</b> Relational database schemas, DDL table migrations (`backend/alembic/`), and SQL query execution via SQLAlchemy ORM.", bullet_style))
    story.append(Paragraph("• <b>Role:</b> Stores structured relational data including user accounts, profile details, course progress, quiz attempt scores, and resume analysis logs.", bullet_style))
    story.append(Paragraph("• <b>When & Where Used:</b> Executed on user login, user profile updates, saving course progress, logging ATS analysis history, and fetching course catalogs.", bullet_style))

    story.append(Spacer(1, 8))

    # Section 2: Frontend Tech Stack
    story.append(Paragraph("2. Frontend Technology Stack", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceBefore=0, spaceAfter=8))

    fe_table_data = [
        [Paragraph("Technology", tbl_header), Paragraph("Category", tbl_header), Paragraph("Location", tbl_header), Paragraph("Exact Situation & Feature Usage", tbl_header)],
        [Paragraph("Next.js 14.2", tbl_cell), Paragraph("Web Framework", tbl_cell), Paragraph("`src/app/`", tbl_cell), Paragraph("Handles App Router page navigation (`/classroom`, `/resume-hub`, `/select-teacher`), layouts, and serverless API route handlers.", tbl_cell)],
        [Paragraph("React 18.3", tbl_cell), Paragraph("UI Library", tbl_cell), Paragraph("`src/components/`", tbl_cell), Paragraph("Powers UI component tree rendering, virtual DOM diffing, component hooks, and interactive DOM state management.", tbl_cell)],
        [Paragraph("Tailwind CSS 3.4", tbl_cell), Paragraph("Styling Framework", tbl_cell), Paragraph("`src/styles/`", tbl_cell), Paragraph("Utility-first responsive styling, glassmorphism UI cards, dark theme gradients, and custom color variables.", tbl_cell)],
        [Paragraph("Framer Motion 11", tbl_cell), Paragraph("Animations", tbl_cell), Paragraph("`src/components/classroom/`", tbl_cell), Paragraph("Powers 3D robot avatar visual breathing effects, glowing eye pulses, modal entry animations, and animated ATS score gauge rings.", tbl_cell)],
        [Paragraph("Monaco Editor", tbl_cell), Paragraph("Browser Code Editor", tbl_cell), Paragraph("`src/components/classroom/`", tbl_cell), Paragraph("Renders live interactive code sandbox in the classroom blackboard for students to write, edit, and run code.", tbl_cell)],
        [Paragraph("pdfjs-dist 6.2", tbl_cell), Paragraph("PDF Parser", tbl_cell), Paragraph("`src/lib/pdfParser.ts`", tbl_cell), Paragraph("Triggered when a user uploads a PDF resume in Resume Hub. Parses and extracts plain text client-side before sending to ATS AI engine.", tbl_cell)],
        [Paragraph("Mammoth 1.12", tbl_cell), Paragraph("DOCX Parser", tbl_cell), Paragraph("`src/lib/pdfParser.ts`", tbl_cell), Paragraph("Parses uploaded Microsoft Word (`.docx`) resume documents to extract raw text formatting.", tbl_cell)],
        [Paragraph("Recharts & Chart.js", tbl_cell), Paragraph("Charts / Analytics", tbl_cell), Paragraph("`src/components/resume/`", tbl_cell), Paragraph("Renders circular ATS match score rings, 5-criteria horizontal metric bars, matched skill radar, and career progress analytics.", tbl_cell)],
        [Paragraph("Zustand 5.0", tbl_cell), Paragraph("Global State Store", tbl_cell), Paragraph("`src/contexts/`", tbl_cell), Paragraph("Lightweight store managing current active slide index, selected AI teacher persona, code editor buffer, and active user session flags.", tbl_cell)],
        [Paragraph("Radix UI Primitives", tbl_cell), Paragraph("Accessible Components", tbl_cell), Paragraph("`src/components/`", tbl_cell), Paragraph("Accessible modal overlays (Teacher Switcher modal, Exit Modal), accordions, popovers, select dropdowns, and toast notifications.", tbl_cell)],
        [Paragraph("react-markdown", tbl_cell), Paragraph("Markdown Renderer", tbl_cell), Paragraph("`src/components/classroom/`", tbl_cell), Paragraph("Renders formatted markdown text, LaTeX equations, and color-coded code blocks returned by AI Professor in live tutoring chats.", tbl_cell)],
        [Paragraph("react-confetti", tbl_cell), Paragraph("FX Celebrations", tbl_cell), Paragraph("`src/app/classroom/`", tbl_cell), Paragraph("Fires celebratory particle confetti when a student completes a course module, scores 100% on a quiz, or reaches ATS target score.", tbl_cell)]
    ]

    fe_table = Table(fe_table_data, colWidths=[90, 85, 115, 214])
    fe_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(fe_table)
    story.append(Spacer(1, 10))

    # Page Break for section 3
    story.append(PageBreak())

    # Section 3: Backend Tech Stack
    story.append(Paragraph("3. Backend Technology Stack", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceBefore=0, spaceAfter=8))

    be_table_data = [
        [Paragraph("Technology", tbl_header), Paragraph("Category", tbl_header), Paragraph("Location", tbl_header), Paragraph("Exact Situation & Feature Usage", tbl_header)],
        [Paragraph("FastAPI 0.115", tbl_cell), Paragraph("Async Framework", tbl_cell), Paragraph("`backend/app/main.py`", tbl_cell), Paragraph("Powers backend REST API endpoints (`/api/v1/`), multi-agent execution routes, streaming endpoints, and health monitoring.", tbl_cell)],
        [Paragraph("Uvicorn & Gunicorn", tbl_cell), Paragraph("ASGI Server", tbl_cell), Paragraph("`backend/Dockerfile`", tbl_cell), Paragraph("Production ASGI web server running FastAPI application with asynchronous worker processes.", tbl_cell)],
        [Paragraph("Google Gemini 2.0", tbl_cell), Paragraph("Primary LLM Engine", tbl_cell), Paragraph("`backend/app/agents/`", tbl_cell), Paragraph("Generates multi-slide lesson content, live interactive classroom Q&A tutoring responses, ATS resume keyword scoring, and doubt fixes.", tbl_cell)],
        [Paragraph("Groq API 1.6", tbl_cell), Paragraph("Low-Latency LLM", tbl_cell), Paragraph("`backend/app/agents/`", tbl_cell), Paragraph("Ultra-fast inference provider used as primary/secondary agent engine for instant conversational speech and chat responses.", tbl_cell)],
        [Paragraph("OpenAI API 2.52", tbl_cell), Paragraph("Supplemental LLM", tbl_cell), Paragraph("`backend/app/agents/`", tbl_cell), Paragraph("Backup multi-modal LLM engine for specialized code evaluation, complex reasoning, and fallback responses.", tbl_cell)],
        [Paragraph("PostgreSQL", tbl_cell), Paragraph("Relational Database", tbl_cell), Paragraph("`backend/app/models/`", tbl_cell), Paragraph("Persistent database storing user accounts, profile data, course structures, resume history, quiz scores, and agent logs.", tbl_cell)],
        [Paragraph("SQLAlchemy 2.0", tbl_cell), Paragraph("Async Python ORM", tbl_cell), Paragraph("`backend/app/core/db.py`", tbl_cell), Paragraph("Handles object-relational mapping and async database query building.", tbl_cell)],
        [Paragraph("AsyncPG 0.30", tbl_cell), Paragraph("Async DB Driver", tbl_cell), Paragraph("`backend/app/core/db.py`", tbl_cell), Paragraph("High-performance non-blocking driver connecting FastAPI to PostgreSQL.", tbl_cell)],
        [Paragraph("Alembic 1.14", tbl_cell), Paragraph("DB Migrations", tbl_cell), Paragraph("`backend/alembic/`", tbl_cell), Paragraph("Manages relational database schema version control and DDL migration scripts.", tbl_cell)],
        [Paragraph("Redis 5.2", tbl_cell), Paragraph("Cache & Broker", tbl_cell), Paragraph("`backend/app/core/redis.py`", tbl_cell), Paragraph("In-memory cache for user sessions, API rate limiting, LLM response caching, and Celery message broker.", tbl_cell)],
        [Paragraph("Celery 5.4", tbl_cell), Paragraph("Task Queue", tbl_cell), Paragraph("`backend/app/core/celery.py`", tbl_cell), Paragraph("Executes asynchronous background computational jobs (heavy ATS analysis, report generation, batch AI tasks).", tbl_cell)],
        [Paragraph("Firebase Admin SDK", tbl_cell), Paragraph("Authentication", tbl_cell), Paragraph("`backend/app/core/security.py`", tbl_cell), Paragraph("Verifies user authentication tokens, Google OAuth sign-in, and security rules (`firestore.rules`).", tbl_cell)],
        [Paragraph("WebSockets 14.1", tbl_cell), Paragraph("Real-Time Streaming", tbl_cell), Paragraph("`backend/app/api/websocket_routes.py`", tbl_cell), Paragraph("Full-duplex real-time communication channel between frontend classroom UI and backend AI agents for live voice & text streaming.", tbl_cell)],
        [Paragraph("Stripe API 11.0", tbl_cell), Paragraph("Payment Processing", tbl_cell), Paragraph("`backend/app/services/stripe.py`", tbl_cell), Paragraph("Manages user subscription plans, premium checkout transactions, and webhook events.", tbl_cell)],
        [Paragraph("Sentry & Prometheus", tbl_cell), Paragraph("Monitoring / Telemetry", tbl_cell), Paragraph("`backend/app/main.py`", tbl_cell), Paragraph("Captures backend exceptions (Sentry) and exposes system telemetry performance metrics (Prometheus) at `/health`.", tbl_cell)]
    ]

    be_table = Table(be_table_data, colWidths=[90, 85, 115, 214])
    be_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(be_table)
    story.append(Spacer(1, 10))

    # Section 4: DevOps & Infrastructure
    story.append(Paragraph("4. DevOps, Infrastructure & Build Tooling", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceBefore=0, spaceAfter=8))

    devops_data = [
        [Paragraph("Tool / Service", tbl_header), Paragraph("Category", tbl_header), Paragraph("Config File", tbl_header), Paragraph("Practical Deployment Context & Situation", tbl_header)],
        [Paragraph("Docker & Docker Compose", tbl_cell), Paragraph("Containerization", tbl_cell), Paragraph("`Dockerfile`<br/>`docker-compose.yml`", tbl_cell), Paragraph("Packages Next.js frontend, Python FastAPI backend, PostgreSQL, and Redis into unified containerized environments for dev and prod.", tbl_cell)],
        [Paragraph("Vercel", tbl_cell), Paragraph("Frontend Hosting", tbl_cell), Paragraph("`vercel.json`<br/>`.vercelignore`", tbl_cell), Paragraph("Deploys Next.js 14 frontend app with edge routing, SSL certificates, and CI/CD preview builds on git push.", tbl_cell)],
        [Paragraph("Render Platform", tbl_cell), Paragraph("Backend Hosting", tbl_cell), Paragraph("`render.yaml`", tbl_cell), Paragraph("Deploys Python FastAPI backend Web Service and Celery worker instances with automatic scaling and health monitoring.", tbl_cell)],
        [Paragraph("ESLint & Prettier", tbl_cell), Paragraph("Code Quality", tbl_cell), Paragraph("`.eslintrc.json`", tbl_cell), Paragraph("Ensures code formatting consistency and static code analysis during CI/CD steps.", tbl_cell)]
    ]

    devops_table = Table(devops_data, colWidths=[90, 85, 115, 214])
    devops_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(devops_table)
    story.append(Spacer(1, 10))

    # Section 5: Feature Situation Mapping
    story.append(Paragraph("5. Step-by-Step Feature Situation Mapping", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("<b>Feature 1: AI Resume Analysis & ATS Scoring</b>", h2_style))
    story.append(Paragraph("1. User uploads a PDF/DOCX resume file in Resume Hub UI.", bullet_style))
    story.append(Paragraph("2. `pdfjs-dist` or `mammoth` parses and extracts plain text client-side in the browser.", bullet_style))
    story.append(Paragraph("3. Extracted resume text is sent to Next.js API route `/api/resume/analyze`.", bullet_style))
    story.append(Paragraph("4. Gemini 2.0 Flash evaluates the resume text against the target job description across 5 ATS criteria.", bullet_style))
    story.append(Paragraph("5. Recharts / Chart.js renders the overall ATS Score circular ring gauge and color-coded keyword chips.", bullet_style))

    story.append(Paragraph("<b>Feature 2: Live Interactive Classroom</b>", h2_style))
    story.append(Paragraph("1. Student launches classroom course page.", bullet_style))
    story.append(Paragraph("2. Framer Motion renders 3D robot avatar animations.", bullet_style))
    story.append(Paragraph("3. Monaco Editor displays interactive code blackboard.", bullet_style))
    story.append(Paragraph("4. Student submits a doubt/question via speech (Web Speech API) or chat input.", bullet_style))
    story.append(Paragraph("5. WebSockets streams query to FastAPI backend, where Gemini/Groq agent streams live response back.", bullet_style))

    story.append(Paragraph("<b>Feature 3: Dynamic AI Teacher Persona Switcher</b>", h2_style))
    story.append(Paragraph("1. Student clicks 'Switch Teacher' inside the active live classroom.", bullet_style))
    story.append(Paragraph("2. Radix UI Dialog opens without resetting current slide index or code editor buffer.", bullet_style))
    story.append(Paragraph("3. Student selects persona (Professor, Coach, Friend, Expert, Simplifier).", bullet_style))
    story.append(Paragraph("4. Zustand updates global persona state instantly.", bullet_style))
    story.append(Paragraph("5. Avatar chest emblem, eye glow color, and AI response voice tone transform dynamically.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("<i>End of AURA Learn Project Technology Stack Guide</i>", ParagraphStyle('End', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=9, textColor=subtext_color, alignment=1)))

    doc.build(story, canvasmaker=NormalCanvas)
    print(f"Successfully generated normal PDF report at: {filename}")

if __name__ == "__main__":
    out1 = os.path.join(os.getcwd(), "AURA_Learn_Project_Stack_Guide.pdf")
    out2 = os.path.join(os.getcwd(), "AURA_Learn_Project_Stack_Details.pdf")
    create_normal_pdf(out1)
    create_normal_pdf(out2)
