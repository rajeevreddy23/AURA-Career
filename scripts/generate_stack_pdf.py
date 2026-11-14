import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#4C1D95"))
            self.drawString(54, 11 * 72 - 36, "AURA LEARN / AURA CAREER")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(8.5 * 72 - 54, 11 * 72 - 36, "Full Project Technology Stack & Architecture Details")
            
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, 45, 8.5 * 72 - 54, 45)

        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 30, "Confidential - AURA Career Architectural Document")
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 30, page_text)
        
        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#4C1D95") # Deep Purple
    secondary_color = colors.HexColor("#0284C7") # Ocean Cyan
    dark_neutral = colors.HexColor("#0F172A") # Slate 900
    body_color = colors.HexColor("#334155") # Slate 700
    card_bg = colors.HexColor("#F8FAFC") # Slate 50

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=secondary_color,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=dark_neutral,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=body_color,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=body_color,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=dark_neutral
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=primary_color
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E1B4B")
    )

    story = []

    # Title Block
    story.append(Paragraph("AURA CAREER & LEARN PLATFORM", title_style))
    story.append(Paragraph("Comprehensive Project Stack & Technology Situation Mapping PDF", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=0, spaceAfter=12))

    # Executive Overview Box
    summary_text = (
        "<b>Executive Overview:</b> AURA Learn (AURA Career) is an interactive, multi-agent AI career development "
        "and tutoring ecosystem. The platform features an AI Resume Analyzer & ATS Scanner, Live Multi-Slide Interactive "
        "Classroom, Dynamic AI Teacher Avatar & Persona Switching, Browser Coding Sandbox, and Real-Time Doubt Resolution. "
        "This document details every programming language, backend/frontend framework, database engine, AI provider, and "
        "utility used in the codebase, along with the precise situation and runtime context in which each technology is executed."
    )
    callout_data = [[Paragraph(summary_text, callout_style)]]
    callout_table = Table(callout_data, colWidths=[504])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F3E8FF")),
        ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor("#C084FC")),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 10))

    # SECTION 1: PROGRAMMING LANGUAGES
    story.append(Paragraph("1. Programming Languages & Usage Context", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceBefore=2, spaceAfter=8))

    lang_data = [
        [
            Paragraph("Language", table_header_style),
            Paragraph("Version / Scope", table_header_style),
            Paragraph("Core Architectural Role & Where Used", table_header_style),
            Paragraph("Specific Triggering Situation", table_header_style)
        ],
        [
            Paragraph("TypeScript", table_cell_bold),
            Paragraph("v5.5<br/>Frontend & Edge", table_cell_style),
            Paragraph("Primary language for 100% of frontend React UI (`src/`), Next.js components, Zustand stores, custom hooks, and Next.js serverless API routes.", table_cell_style),
            Paragraph("Executed during client-side user interactions, state transitions, client-side PDF parsing, and serverless API route dispatching.", table_cell_style)
        ],
        [
            Paragraph("Python", table_cell_bold),
            Paragraph("v3.11+<br/>Backend Services", table_cell_style),
            Paragraph("Primary language for backend microservices (`backend/app/`), multi-agent LLM framework, FastAPI routing, ORM models, and Celery async workers.", table_cell_style),
            Paragraph("Triggered when processing deep AI agent workflows, PostgreSQL DB transactions, WebSocket live streams, and background jobs.", table_cell_style)
        ],
        [
            Paragraph("JavaScript (ES2023 / Node)", table_cell_bold),
            Paragraph("Node.js Runtime<br/>Tooling & Config", table_cell_style),
            Paragraph("Powers configuration scripts (`next.config.js`, `postcss.config.js`), build pipelines, and Next.js NodeJS server environment.", table_cell_style),
            Paragraph("Executed during application build (`npm run build`), SSR rendering, and development server execution (`npm run dev`).", table_cell_style)
        ],
        [
            Paragraph("HTML5 & CSS3 / Tailwind", table_cell_bold),
            Paragraph("HTML5, CSS3, Tailwind v3.4", table_cell_style),
            Paragraph("Markup structure and responsive visual presentation (`src/styles/`). Includes CSS keyframe animations, HSL tokens, and dark theme design.", table_cell_style),
            Paragraph("Rendered continuously by web browser DOM engine across all pages (Classroom, Resume Hub, Teacher Switcher).", table_cell_style)
        ],
        [
            Paragraph("SQL (PostgreSQL)", table_cell_bold),
            Paragraph("PostgreSQL 15+ Dialect", table_cell_style),
            Paragraph("Relational database schema definitions, data persistence, indexed queries, and migration DDL scripts (managed via Alembic).", table_cell_style),
            Paragraph("Executed during user auth verification, user profile updates, saving course progress, and querying course catalogs.", table_cell_style)
        ]
    ]

    lang_table = Table(lang_data, colWidths=[90, 85, 175, 154])
    lang_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(lang_table)
    story.append(Spacer(1, 12))

    # SECTION 2: FRONTEND TECH STACK
    story.append(Paragraph("2. Frontend Technology Stack & Situation Breakdown", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceBefore=2, spaceAfter=8))

    fe_data = [
        [
            Paragraph("Technology / Library", table_header_style),
            Paragraph("Category", table_header_style),
            Paragraph("File / Module Path", table_header_style),
            Paragraph("Exact Situation & Feature Usage", table_header_style)
        ],
        [
            Paragraph("Next.js 14 (App Router)", table_cell_bold),
            Paragraph("Core Web Framework", table_cell_style),
            Paragraph("`src/app/`", table_cell_style),
            Paragraph("Handles server rendering, layout hierarchy, routing (`/classroom`, `/resume-hub`, `/select-teacher`), and Next API routes.", table_cell_style)
        ],
        [
            Paragraph("React 18 & React DOM", table_cell_bold),
            Paragraph("UI View Engine", table_cell_style),
            Paragraph("`src/components/`", table_cell_style),
            Paragraph("Powers component lifecycle, dynamic UI rerendering, virtual DOM reconciliation, and interactive user inputs.", table_cell_style)
        ],
        [
            Paragraph("Tailwind CSS 3.4 & Vanilla CSS", table_cell_bold),
            Paragraph("Styling Engine", table_cell_style),
            Paragraph("`tailwind.config.ts`<br/>`src/styles/`", table_cell_style),
            Paragraph("Utility classes and custom CSS providing responsive layouts, dark glassmorphism UI, gradient themes, and visual tokens.", table_cell_style)
        ],
        [
            Paragraph("Framer Motion 11", table_cell_bold),
            Paragraph("Animation Library", table_cell_style),
            Paragraph("`src/components/classroom/`", table_cell_style),
            Paragraph("Powers robot avatar breathing animation, glowing visual pulses, modal entrance popups, and animated ATS score gauge rings.", table_cell_style)
        ],
        [
            Paragraph("@monaco-editor/react 4.6", table_cell_bold),
            Paragraph("Browser Code Editor", table_cell_style),
            Paragraph("`src/components/classroom/`", table_cell_style),
            Paragraph("Renders live interactive code sandbox in the classroom blackboard for students to write, edit, and test code snippets.", table_cell_style)
        ],
        [
            Paragraph("pdfjs-dist 6.2", table_cell_bold),
            Paragraph("Client PDF Parser", table_cell_style),
            Paragraph("`src/lib/pdfParser.ts`", table_cell_style),
            Paragraph("Triggered immediately when a user uploads a PDF resume in Resume Hub. Extracts raw resume text client-side before ATS scoring.", table_cell_style)
        ],
        [
            Paragraph("Mammoth 1.12", table_cell_bold),
            Paragraph("DOCX Parser", table_cell_style),
            Paragraph("`src/lib/pdfParser.ts`", table_cell_style),
            Paragraph("Parses Microsoft Word (`.docx`) resume documents uploaded by users to extract plain text formatting.", table_cell_style)
        ],
        [
            Paragraph("Chart.js & Recharts 2.12", table_cell_bold),
            Paragraph("Data Visualization", table_cell_style),
            Paragraph("`src/components/resume/`", table_cell_style),
            Paragraph("Visualizes ATS score radial charts, 5-criteria horizontal progress bars, matched skill radar, and career growth analytics.", table_cell_style)
        ],
        [
            Paragraph("Zustand 5.0", table_cell_bold),
            Paragraph("Global State Store", table_cell_style),
            Paragraph("`src/contexts/`", table_cell_style),
            Paragraph("Manages real-time client state for current active slide index, selected AI teacher persona, code sandbox buffer, and user theme.", table_cell_style)
        ],
        [
            Paragraph("Radix UI & Headless UI", table_cell_bold),
            Paragraph("UI Primitives", table_cell_style),
            Paragraph("`src/components/`", table_cell_style),
            Paragraph("Accessible UI elements for modal dialogs (Teacher Switcher, Exit Modal), accordions, popovers, select boxes, and toasts.", table_cell_style)
        ],
        [
            Paragraph("react-markdown & syntax-highlighter", table_cell_bold),
            Paragraph("Markdown Renderer", table_cell_style),
            Paragraph("`src/components/classroom/`", table_cell_style),
            Paragraph("Renders formatted markdown text, LaTeX equations, and color-coded code blocks returned by AI Professor in live chat.", table_cell_style)
        ],
        [
            Paragraph("react-confetti 6.1", table_cell_bold),
            Paragraph("FX / Celebrations", table_cell_style),
            Paragraph("`src/app/classroom/`", table_cell_style),
            Paragraph("Fires confetti animation when a student completes a course module, achieves 100% on a quiz, or reaches ATS target score.", table_cell_style)
        ]
    ]

    fe_table = Table(fe_data, colWidths=[110, 80, 114, 200])
    fe_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), secondary_color),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(fe_table)
    story.append(Spacer(1, 12))

    # Page Break for section 3
    story.append(PageBreak())

    # SECTION 3: BACKEND TECH STACK
    story.append(Paragraph("3. Backend Technology Stack & Situation Breakdown", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceBefore=2, spaceAfter=8))

    be_data = [
        [
            Paragraph("Technology / Library", table_header_style),
            Paragraph("Category", table_header_style),
            Paragraph("File / Module Path", table_header_style),
            Paragraph("Exact Situation & Feature Usage", table_header_style)
        ],
        [
            Paragraph("FastAPI 0.115", table_cell_bold),
            Paragraph("Async Web Framework", table_cell_style),
            Paragraph("`backend/app/main.py`<br/>`backend/app/api/`", table_cell_style),
            Paragraph("Powers backend REST API routes (`/api/v1/`), multi-agent endpoints, streaming endpoints, and OpenAPI documentation.", table_cell_style)
        ],
        [
            Paragraph("Uvicorn 0.30 & Gunicorn 23", table_cell_bold),
            Paragraph("ASGI Server Engine", table_cell_style),
            Paragraph("`backend/Dockerfile`", table_cell_style),
            Paragraph("Production ASGI web server running FastAPI application with async worker processes.", table_cell_style)
        ],
        [
            Paragraph("Google Gemini API (2.0 Flash)", table_cell_bold),
            Paragraph("Primary LLM Engine", table_cell_style),
            Paragraph("`backend/app/agents/`<br/>`src/app/api/`", table_cell_style),
            Paragraph("Executes multi-slide lesson generation, live classroom Q&A tutoring, ATS resume keyword scoring, and doubt resolution.", table_cell_style)
        ],
        [
            Paragraph("Groq API 1.6", table_cell_bold),
            Paragraph("Low-Latency LLM", table_cell_style),
            Paragraph("`backend/app/agents/`", table_cell_style),
            Paragraph("Ultra-fast inference provider used as primary/secondary agent engine for instant conversational speech/chat responses.", table_cell_style)
        ],
        [
            Paragraph("OpenAI API 2.52", table_cell_bold),
            Paragraph("Supplemental LLM", table_cell_style),
            Paragraph("`backend/app/agents/`", table_cell_style),
            Paragraph("Backup multi-modal LLM engine for specialized code evaluation, complex reasoning, and fallback responses.", table_cell_style)
        ],
        [
            Paragraph("PostgreSQL & SQLAlchemy 2.0", table_cell_bold),
            Paragraph("Async Database & ORM", table_cell_style),
            Paragraph("`backend/app/models/`<br/>`backend/app/core/`", table_cell_style),
            Paragraph("Stores persistent data for users, user profiles, course structures, resume history, quiz scores, and agent interaction logs.", table_cell_style)
        ],
        [
            Paragraph("AsyncPG 0.30", table_cell_bold),
            Paragraph("Async PostgreSQL Driver", table_cell_style),
            Paragraph("`backend/app/core/db.py`", table_cell_style),
            Paragraph("High-performance non-blocking database driver handling async queries between FastAPI and PostgreSQL.", table_cell_style)
        ],
        [
            Paragraph("Alembic 1.14", table_cell_bold),
            Paragraph("Database Migrations", table_cell_style),
            Paragraph("`backend/alembic/`", table_cell_style),
            Paragraph("Manages relational database schema versioning, DDL migrations, and table creations.", table_cell_style)
        ],
        [
            Paragraph("Redis 5.2 & Hiredis", table_cell_bold),
            Paragraph("In-Memory Cache & Broker", table_cell_style),
            Paragraph("`backend/app/core/redis.py`", table_cell_style),
            Paragraph("Fast caching store for active user sessions, API rate limiting, LLM prompt response caching, and Celery task broker.", table_cell_style)
        ],
        [
            Paragraph("Celery 5.4", table_cell_bold),
            Paragraph("Async Background Queue", table_cell_style),
            Paragraph("`backend/app/core/celery.py`", table_cell_style),
            Paragraph("Handles background heavy compute tasks, deep ATS analysis jobs, PDF processing, and periodic report generation.", table_cell_style)
        ],
        [
            Paragraph("Firebase Admin 6.6 & Client 10", table_cell_bold),
            Paragraph("Identity & Auth", table_cell_style),
            Paragraph("`backend/app/core/security.py`", table_cell_style),
            Paragraph("Handles user authentication, Google OAuth sign-in, JWT token validation, user security rules (`firestore.rules`).", table_cell_style)
        ],
        [
            Paragraph("WebSockets 14.1", table_cell_bold),
            Paragraph("Real-Time Streaming", table_cell_style),
            Paragraph("`backend/app/api/websocket_routes.py`", table_cell_style),
            Paragraph("Full-duplex real-time channel between frontend live classroom UI and backend AI agents for live voice & text streaming.", table_cell_style)
        ],
        [
            Paragraph("Stripe 11.0", table_cell_bold),
            Paragraph("Payment Gateway", table_cell_style),
            Paragraph("`backend/app/services/stripe.py`", table_cell_style),
            Paragraph("Manages user subscription plans, premium feature access checkout, and webhooks.", table_cell_style)
        ],
        [
            Paragraph("Passlib + Bcrypt & Python-JOSE", table_cell_bold),
            Paragraph("Security & Cryptography", table_cell_style),
            Paragraph("`backend/app/core/security.py`", table_cell_style),
            Paragraph("Hashes user passwords securely with bcrypt and signs/verifies JSON Web Tokens (JWT).", table_cell_style)
        ],
        [
            Paragraph("Sentry SDK 2.17 & Prometheus", table_cell_bold),
            Paragraph("Monitoring & Metrics", table_cell_style),
            Paragraph("`backend/app/main.py`", table_cell_style),
            Paragraph("Captures backend runtime errors (Sentry) and exposes system telemetry metrics (Prometheus) at `/health` endpoint.", table_cell_style)
        ]
    ]

    be_table = Table(be_data, colWidths=[110, 80, 114, 200])
    be_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(be_table)
    story.append(Spacer(1, 12))

    # SECTION 4: DEVOPS & INFRASTRUCTURE
    story.append(Paragraph("4. DevOps, Infrastructure & Deployment Stack", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceBefore=2, spaceAfter=8))

    devops_data = [
        [
            Paragraph("Component / Tool", table_header_style),
            Paragraph("Category", table_header_style),
            Paragraph("Configuration File", table_header_style),
            Paragraph("Practical Deployment Context & Situation", table_header_style)
        ],
        [
            Paragraph("Docker & Docker Compose", table_cell_bold),
            Paragraph("Containerization", table_cell_style),
            Paragraph("`Dockerfile`<br/>`docker-compose.yml`", table_cell_style),
            Paragraph("Packages Next.js frontend, Python FastAPI backend, PostgreSQL, and Redis into unified containerized environments for dev and prod.", table_cell_style)
        ],
        [
            Paragraph("Vercel", table_cell_bold),
            Paragraph("Frontend Cloud Hosting", table_cell_style),
            Paragraph("`vercel.json`<br/>`.vercelignore`", table_cell_style),
            Paragraph("Deploys Next.js 14 frontend app with edge routing, automatic SSL certificates, and CI/CD preview deployments on git push.", table_cell_style)
        ],
        [
            Paragraph("Render Platform", table_cell_bold),
            Paragraph("Backend Hosting", table_cell_style),
            Paragraph("`render.yaml`", table_cell_style),
            Paragraph("Deploys Python FastAPI backend Web Service and Celery worker instances with automatic scaling and health monitoring.", table_cell_style)
        ],
        [
            Paragraph("ESLint, Prettier & TypeScript", table_cell_bold),
            Paragraph("Code Quality & Linting", table_cell_style),
            Paragraph("`.eslintrc.json`<br/>`tsconfig.json`", table_cell_style),
            Paragraph("Ensures code consistency, type check validation (`npm run typecheck`), and automated formatting during CI/CD build steps.", table_cell_style)
        ]
    ]

    devops_table = Table(devops_data, colWidths=[110, 80, 114, 200])
    devops_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(devops_table)
    story.append(Spacer(1, 12))

    # SECTION 5: SITUATION MATRIX / FEATURE MAPPING SUMMARY
    story.append(Paragraph("5. Key Application Features & Exact Technology Situations", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceBefore=2, spaceAfter=8))

    feature_data = [
        [
            Paragraph("Application Feature", table_header_style),
            Paragraph("Technologies Triggered", table_header_style),
            Paragraph("Step-by-Step Execution Situation", table_header_style)
        ],
        [
            Paragraph("1. AI Resume Analysis & ATS Scoring", table_cell_bold),
            Paragraph("• `pdfjs-dist` / `mammoth`<br/>• Next.js API Routes<br/>• Gemini 2.0 Flash<br/>• Recharts / Chart.js", table_cell_style),
            Paragraph("1. User uploads PDF/DOCX resume file in Resume Hub UI.<br/>2. `pdfjs-dist` extracts text client-side in browser.<br/>3. Text sent to Next.js API `/api/resume/analyze`.<br/>4. Gemini 2.0 Flash evaluates resume against target role.<br/>5. Recharts renders ATS Score ring and keyword chips.", table_cell_style)
        ],
        [
            Paragraph("2. Live Interactive Classroom", table_cell_bold),
            Paragraph("• Next.js App Router<br/>• Framer Motion<br/>• Monaco Editor<br/>• WebSockets<br/>• Python FastAPI<br/>• Gemini / Groq", table_cell_style),
            Paragraph("1. Student launches classroom course page.<br/>2. Framer Motion renders 3D robot avatar animations.<br/>3. Monaco Editor displays interactive code blackboard.<br/>4. Student asks question via WebSockets / API route.<br/>5. FastAPI + Gemini/Groq streams live Professor explanation.", table_cell_style)
        ],
        [
            Paragraph("3. Dynamic AI Teacher Persona Switching", table_cell_bold),
            Paragraph("• React Context / Zustand<br/>• Framer Motion<br/>• Radix UI Dialog<br/>• HSL CSS Tokens", table_cell_style),
            Paragraph("1. Student clicks 'Switch Teacher' in live classroom.<br/>2. Radix UI modal opens without losing current slide/code.<br/>3. Student selects persona (Professor, Coach, Friend, Expert).<br/>4. Zustand updates global persona state.<br/>5. Robot avatar chest emblem, eye glow, & voice prompt shift instantly.", table_cell_style)
        ],
        [
            Paragraph("4. Technical Doubt Resolution & Code Lab", table_cell_bold),
            Paragraph("• Monaco Editor<br/>• Next.js API `/api/doubt`<br/>• Python FastAPI Agent<br/>• AsyncPG / PostgreSQL", table_cell_style),
            Paragraph("1. Student inputs code snippet and error log.<br/>2. Monaco Editor formats syntax.<br/>3. Agent backend executes heuristic diagnostic scan.<br/>4. AI tutor returns step-by-step fix and memory diagram.<br/>5. Doubt log saved to PostgreSQL via AsyncPG for review.", table_cell_style)
        ]
    ]

    feature_table = Table(feature_data, colWidths=[120, 130, 254])
    feature_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(feature_table)
    story.append(Spacer(1, 15))

    # Closing signoff block
    signoff_text = (
        "<b>Summary:</b> The AURA Career architecture combines modern TypeScript client-side interactivity "
        "with a robust Python FastAPI multi-agent backend. This document provides a complete blueprint of the stack "
        "for developers, system architects, and stakeholders."
    )
    story.append(Paragraph(signoff_text, body_style))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF report at: {filename}")

if __name__ == "__main__":
    out_pdf = os.path.join(os.getcwd(), "AURA_Learn_Project_Stack_Details.pdf")
    build_pdf(out_pdf)
