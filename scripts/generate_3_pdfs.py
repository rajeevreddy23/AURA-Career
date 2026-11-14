import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class StandardCanvas(canvas.Canvas):
    def __init__(self, doc_title, *args, **kwargs):
        self.doc_title = doc_title
        super(StandardCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(StandardCanvas, self).showPage()
        super(StandardCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header (page > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * 72 - 36, f"AuraCareer - {self.doc_title}")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Footer
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 8.5 * 72 - 54, 45)
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 30, page_text)
        self.drawString(54, 30, f"AURA Career Platform • {self.doc_title}")
        self.restoreState()


def get_styles():
    styles = getSampleStyleSheet()
    text_dark = colors.HexColor("#1E293B")
    heading_dark = colors.HexColor("#0F172A")
    accent_blue = colors.HexColor("#2563EB")
    subtext_color = colors.HexColor("#475569")

    return {
        'title': ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=heading_dark, spaceAfter=4),
        'subtitle': ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontName='Helvetica', fontSize=10.5, leading=14, textColor=subtext_color, spaceAfter=12),
        'h1': ParagraphStyle('Heading1', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=heading_dark, spaceBefore=12, spaceAfter=6, keepWithNext=True),
        'h2': ParagraphStyle('Heading2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10.5, leading=14, textColor=accent_blue, spaceBefore=8, spaceAfter=4, keepWithNext=True),
        'body': ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=13.5, textColor=text_dark, spaceAfter=6),
        'bullet': ParagraphStyle('Bullet', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=13.5, textColor=text_dark, leftIndent=14, firstLineIndent=-10, spaceAfter=4),
        'tbl_header': ParagraphStyle('THeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=heading_dark),
        'tbl_cell': ParagraphStyle('TCell', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=text_dark)
    }


# PDF 1: OVERVIEW AND LANGUAGES
def generate_pdf1(filename):
    st = get_styles()
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []

    story.append(Paragraph("PDF 1: AuraCareer - Project Overview & Languages Guide", st['title']))
    story.append(Paragraph("Part 1 of 3: Core Architecture, System Features & Programming Language Breakdown", st['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0F172A"), spaceBefore=0, spaceAfter=10))

    story.append(Paragraph("1. Executive Platform Architecture", st['h1']))
    story.append(Paragraph("AuraCareer (AURA Career) is an interactive, multi-agent AI career development and tutoring platform. The ecosystem consists of five core pillars:", st['body']))
    story.append(Paragraph("• <b>AI Resume Analyzer & ATS Scanner:</b> Extracts PDF/DOCX resume text, matches target job descriptions, computes 0-100 ATS scores across 5 criteria, and suggests section improvements.", st['bullet']))
    story.append(Paragraph("• <b>Live Multi-Slide Interactive Classroom:</b> Features live AI Professor streaming, multi-slide curriculum presentation, interactive code blackboard, and voice/speech mode.", st['bullet']))
    story.append(Paragraph("• <b>Dynamic AI Teacher Avatar:</b> Real-time persona switching (Professor, Coach, Friend, Expert, Simplifier) modifying robot avatar chest emblem, eye glow, and response style.", st['bullet']))
    story.append(Paragraph("• <b>Interactive Coding Lab Sandbox:</b> Browser-based IDE editor powered by Monaco Editor with syntax highlighting and code execution support.", st['bullet']))
    story.append(Paragraph("• <b>Technical Doubt Resolver:</b> Diagnostic AI mentorship tool generating code fixes, explanation notes, and data structure diagrams.", st['bullet']))

    story.append(Spacer(1, 8))
    story.append(Paragraph("2. Programming Languages Breakdown", st['h1']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("<b>1. TypeScript (v5.5)</b>", st['h2']))
    story.append(Paragraph("• <b>Scope & Location:</b> 100% of frontend React UI code (`src/`), component files (`.tsx`), type interfaces (`src/types/`), custom hooks (`src/hooks/`), Zustand stores, and Next.js serverless API routes (`src/app/api/`).", st['bullet']))
    story.append(Paragraph("• <b>Role:</b> End-to-end static type safety for API requests, prompt payloads, state mutations, and UI props.", st['bullet']))
    story.append(Paragraph("• <b>Situation:</b> Triggered during client rendering, user UI actions, client PDF text parsing, and Next serverless endpoint execution.", st['bullet']))

    story.append(Paragraph("<b>2. Python (v3.11+)</b>", st['h2']))
    story.append(Paragraph("• <b>Scope & Location:</b> Backend microservice (`backend/app/`), AI agent framework (`backend/app/agents/`), FastAPI routes (`backend/app/api/`), SQLAlchemy models (`backend/app/models/`), and Celery async workers.", st['bullet']))
    story.append(Paragraph("• <b>Role:</b> Core backend language powering multi-agent LLM orchestration, PostgreSQL ORM queries, background task processing, and WebSocket streaming.", st['bullet']))
    story.append(Paragraph("• <b>Situation:</b> Triggered when processing deep AI requests, querying database models, streaming AI Professor live responses, and running async Celery background jobs.", st['bullet']))

    story.append(Paragraph("<b>3. JavaScript (ES2023 / Node.js)</b>", st['h2']))
    story.append(Paragraph("• <b>Scope & Location:</b> Configuration scripts (`next.config.js`, `postcss.config.js`, `.eslintrc.json`), build tools, and NodeJS server environment.", st['bullet']))
    story.append(Paragraph("• <b>Role:</b> Executes web server initializations, SSR page pre-rendering, build optimizations, and PostCSS processing.", st['bullet']))
    story.append(Paragraph("• <b>Situation:</b> Triggered during development (`npm run dev`), production build (`npm run build`), and SSR execution.", st['bullet']))

    story.append(Paragraph("<b>4. HTML5 & CSS3 / Tailwind CSS (v3.4)</b>", st['h2']))
    story.append(Paragraph("• <b>Scope & Location:</b> Component markup and stylesheets (`src/styles/globals.css`, `tailwind.config.ts`).", st['bullet']))
    story.append(Paragraph("• <b>Role:</b> Defines responsive visual layout grids, dark glassmorphism styling, HSL visual tokens, and keyframe micro-animations.", st['bullet']))
    story.append(Paragraph("• <b>Situation:</b> Evaluated continuously by web browser DOM layout engines across all pages.", st['bullet']))

    story.append(Paragraph("<b>5. SQL (PostgreSQL Dialect)</b>", st['h2']))
    story.append(Paragraph("• <b>Scope & Location:</b> Relational database schemas, DDL table migrations (`backend/alembic/`), and SQL query execution via SQLAlchemy ORM.", st['bullet']))
    story.append(Paragraph("• <b>Role:</b> Stores structured data for users, profile details, course progress, quiz attempt scores, and resume analysis logs.", st['bullet']))
    story.append(Paragraph("• <b>Situation:</b> Executed on user auth, profile updates, saving course progress, logging ATS analysis history, and fetching course catalogs.", st['bullet']))

    doc.build(story, canvasmaker=lambda *args, **kwargs: StandardCanvas("Part 1 - Overview & Languages", *args, **kwargs))
    print(f"Generated PDF 1: {filename}")


# PDF 2: FRONTEND TECH STACK
def generate_pdf2(filename):
    st = get_styles()
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []

    story.append(Paragraph("PDF 2: AuraCareer - Frontend Technology Stack Guide", st['title']))
    story.append(Paragraph("Part 2 of 3: Comprehensive Client-Side Frameworks, Libraries & Component Situations", st['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0F172A"), spaceBefore=0, spaceAfter=10))

    story.append(Paragraph("1. Frontend Tech Stack Breakdown", st['h1']))
    story.append(Paragraph("The frontend of AuraCareer is built on Next.js 14 App Router, React 18, and TypeScript 5.5, utilizing modern UI libraries and client-side utilities.", st['body']))

    fe_table_data = [
        [Paragraph("Technology", st['tbl_header']), Paragraph("Category", st['tbl_header']), Paragraph("File Path", st['tbl_header']), Paragraph("Exact Situation & Feature Usage", st['tbl_header'])],
        [Paragraph("Next.js 14.2", st['tbl_cell']), Paragraph("Web Framework", st['tbl_cell']), Paragraph("`src/app/`", st['tbl_cell']), Paragraph("App Router page navigation (`/classroom`, `/resume-hub`, `/select-teacher`), layouts, edge serverless route handlers.", st['tbl_cell'])],
        [Paragraph("React 18.3", st['tbl_cell']), Paragraph("UI View Engine", st['tbl_cell']), Paragraph("`src/components/`", st['tbl_cell']), Paragraph("Component tree rendering, virtual DOM diffing, component hooks, interactive state updates.", st['tbl_cell'])],
        [Paragraph("Tailwind CSS 3.4", st['tbl_cell']), Paragraph("Styling", st['tbl_cell']), Paragraph("`src/styles/`", st['tbl_cell']), Paragraph("Utility-first responsive layout styling, dark mode glassmorphism themes, visual design tokens.", st['tbl_cell'])],
        [Paragraph("Framer Motion 11", st['tbl_cell']), Paragraph("Animations", st['tbl_cell']), Paragraph("`src/components/classroom/`", st['tbl_cell']), Paragraph("Robot avatar breathing animation, glowing visual pulses, modal entrance popups, animated ATS score rings.", st['tbl_cell'])],
        [Paragraph("Monaco Editor", st['tbl_cell']), Paragraph("Browser Code IDE", st['tbl_cell']), Paragraph("`src/components/classroom/`", st['tbl_cell']), Paragraph("Interactive browser code sandbox in classroom blackboard for students to write and test code.", st['tbl_cell'])],
        [Paragraph("pdfjs-dist 6.2", st['tbl_cell']), Paragraph("PDF Parser", st['tbl_cell']), Paragraph("`src/lib/pdfParser.ts`", st['tbl_cell']), Paragraph("Triggered when uploading PDF resumes. Extracts plain text client-side before sending to ATS AI.", st['tbl_cell'])],
        [Paragraph("Mammoth 1.12", st['tbl_cell']), Paragraph("DOCX Parser", st['tbl_cell']), Paragraph("`src/lib/pdfParser.ts`", st['tbl_cell']), Paragraph("Parses uploaded Microsoft Word (`.docx`) resume documents to extract raw text formatting.", st['tbl_cell'])],
        [Paragraph("Recharts & Chart.js", st['tbl_cell']), Paragraph("Data Viz", st['tbl_cell']), Paragraph("`src/components/resume/`", st['tbl_cell']), Paragraph("Renders circular ATS match score rings, 5-criteria metric progress bars, skill radar, growth analytics.", st['tbl_cell'])],
        [Paragraph("Zustand 5.0", st['tbl_cell']), Paragraph("Global State Store", st['tbl_cell']), Paragraph("`src/contexts/`", st['tbl_cell']), Paragraph("Stores active slide index, selected AI teacher persona, code editor buffer, user theme.", st['tbl_cell'])],
        [Paragraph("Radix UI Primitives", st['tbl_cell']), Paragraph("UI Components", st['tbl_cell']), Paragraph("`src/components/`", st['tbl_cell']), Paragraph("Accessible modal overlays (Teacher Switcher, Exit Modal), accordions, popovers, select dropdowns, toasts.", st['tbl_cell'])],
        [Paragraph("react-markdown", st['tbl_cell']), Paragraph("Markdown Renderer", st['tbl_cell']), Paragraph("`src/components/classroom/`", st['tbl_cell']), Paragraph("Renders formatted markdown, LaTeX equations, syntax-highlighted code from AI Professor chat.", st['tbl_cell'])],
        [Paragraph("react-confetti", st['tbl_cell']), Paragraph("Celebration FX", st['tbl_cell']), Paragraph("`src/app/classroom/`", st['tbl_cell']), Paragraph("Fires confetti particle animation when completing modules, scoring 100% on quizzes, or reaching target ATS score.", st['tbl_cell'])]
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

    story.append(Paragraph("2. Detailed Client Execution Situations", st['h1']))
    story.append(Paragraph("• <b>PDF/DOCX Resume Upload:</b> When a user drops a resume PDF into Resume Hub, `pdfjs-dist` executes in the browser web worker thread to parse page streams, extract raw strings, and pass them to the ATS AI scoring component without immediate server upload.", st['body']))
    story.append(Paragraph("• <b>Live Classroom Rerendering:</b> When a student switches slides, `Zustand` updates `activeSlideIndex`. `Framer Motion` animates slide transitions while `Monaco Editor` updates its code buffer seamlessly.", st['body']))
    story.append(Paragraph("• <b>Dynamic Teacher Persona Switching:</b> Clicking 'Switch Teacher' triggers a `Radix UI Dialog`. Selecting a persona updates `Zustand`, causing `AIProfessorAvatar.tsx` to alter SVG emblem badges, CSS HSL glow filters, and voice model IDs instantly.", st['body']))

    doc.build(story, canvasmaker=lambda *args, **kwargs: StandardCanvas("Part 2 - Frontend Stack", *args, **kwargs))
    print(f"Generated PDF 2: {filename}")


# PDF 3: BACKEND, AI AND DEVOPS
def generate_pdf3(filename):
    st = get_styles()
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []

    story.append(Paragraph("PDF 3: AuraCareer - Backend, AI Agents & DevOps Guide", st['title']))
    story.append(Paragraph("Part 3 of 3: Python FastAPI Microservice, Gemini LLM Engine, Database & Infrastructure", st['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0F172A"), spaceBefore=0, spaceAfter=10))

    story.append(Paragraph("1. Backend & AI Stack Breakdown", st['h1']))

    be_table_data = [
        [Paragraph("Technology", st['tbl_header']), Paragraph("Category", st['tbl_header']), Paragraph("File Path", st['tbl_header']), Paragraph("Exact Situation & Feature Usage", st['tbl_header'])],
        [Paragraph("FastAPI 0.115", st['tbl_cell']), Paragraph("Async Framework", st['tbl_cell']), Paragraph("`backend/app/main.py`", st['tbl_cell']), Paragraph("Backend REST API routes (`/api/v1/`), multi-agent routes, WebSockets, streaming.", st['tbl_cell'])],
        [Paragraph("Uvicorn & Gunicorn", st['tbl_cell']), Paragraph("ASGI Server Engine", st['tbl_cell']), Paragraph("`backend/Dockerfile`", st['tbl_cell']), Paragraph("Production ASGI web server running FastAPI app with async worker processes.", st['tbl_cell'])],
        [Paragraph("Google Gemini 2.0", st['tbl_cell']), Paragraph("Primary LLM Engine", st['tbl_cell']), Paragraph("`backend/app/agents/`", st['tbl_cell']), Paragraph("Generates multi-slide lessons, live classroom Q&A tutoring responses, ATS resume scoring, doubt fixes.", st['tbl_cell'])],
        [Paragraph("Groq API 1.6", st['tbl_cell']), Paragraph("Low-Latency LLM", st['tbl_cell']), Paragraph("`backend/app/agents/`", st['tbl_cell']), Paragraph("Ultra-fast inference provider used as primary/secondary agent engine for instant conversational speech/chat responses.", st['tbl_cell'])],
        [Paragraph("OpenAI API 2.52", st['tbl_cell']), Paragraph("Supplemental LLM", st['tbl_cell']), Paragraph("`backend/app/agents/`", st['tbl_cell']), Paragraph("Backup multi-modal LLM engine for specialized code evaluation, complex reasoning, fallback responses.", st['tbl_cell'])],
        [Paragraph("PostgreSQL + AsyncPG", st['tbl_cell']), Paragraph("Database & Driver", st['tbl_cell']), Paragraph("`backend/app/models/`", st['tbl_cell']), Paragraph("Persistent storage for users, profile data, course structures, resume history, quiz scores, agent logs.", st['tbl_cell'])],
        [Paragraph("SQLAlchemy 2.0 & Alembic", st['tbl_cell']), Paragraph("ORM & Migrations", st['tbl_cell']), Paragraph("`backend/app/core/db.py`", st['tbl_cell']), Paragraph("Async database ORM models and schema DDL migration version control.", st['tbl_cell'])],
        [Paragraph("Redis 5.2 & Celery 5.4", st['tbl_cell']), Paragraph("Cache & Queue", st['tbl_cell']), Paragraph("`backend/app/core/redis.py`", st['tbl_cell']), Paragraph("Session caching, API rate limiting, LLM response cache, and background task queue execution.", st['tbl_cell'])],
        [Paragraph("Firebase Admin SDK", st['tbl_cell']), Paragraph("Authentication", st['tbl_cell']), Paragraph("`backend/app/core/security.py`", st['tbl_cell']), Paragraph("Verifies user authentication tokens, Google OAuth sign-in, security rules (`firestore.rules`).", st['tbl_cell'])],
        [Paragraph("WebSockets 14.1", st['tbl_cell']), Paragraph("Real-Time Streaming", st['tbl_cell']), Paragraph("`backend/app/api/websocket_routes.py`", st['tbl_cell']), Paragraph("Full-duplex real-time channel between frontend classroom UI and backend AI agents for live streaming.", st['tbl_cell'])],
        [Paragraph("Stripe API 11.0", st['tbl_cell']), Paragraph("Payments", st['tbl_cell']), Paragraph("`backend/app/services/stripe.py`", st['tbl_cell']), Paragraph("Manages subscription tiers, premium checkout transactions, payment webhooks.", st['tbl_cell'])],
        [Paragraph("Sentry & Prometheus", st['tbl_cell']), Paragraph("Telemetry", st['tbl_cell']), Paragraph("`backend/app/main.py`", st['tbl_cell']), Paragraph("Backend error tracking (Sentry) and system performance metrics (Prometheus) at `/health`.", st['tbl_cell'])]
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

    story.append(Paragraph("2. DevOps & Cloud Infrastructure", st['h1']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("• <b>Docker & Docker Compose:</b> Packages Next.js frontend, Python FastAPI backend, PostgreSQL, and Redis into multi-stage container environments (`Dockerfile`, `docker-compose.yml`).", st['body']))
    story.append(Paragraph("• <b>Vercel Deployment:</b> Hosts Next.js App Router frontend with edge routing, automated SSL, and git push deployments (`vercel.json`).", st['body']))
    story.append(Paragraph("• <b>Render Platform:</b> Deploys Python FastAPI web service and Celery background workers (`render.yaml`).", st['body']))
    story.append(Paragraph("• <b>ESLint, Prettier & TypeScript Compiler:</b> Performs automated static analysis, code linting, and type checking (`npm run typecheck`).", st['body']))

    doc.build(story, canvasmaker=lambda *args, **kwargs: StandardCanvas("Part 3 - Backend & DevOps", *args, **kwargs))
    print(f"Generated PDF 3: {filename}")


if __name__ == "__main__":
    pdf1 = os.path.join(os.getcwd(), "1_AuraCareer_Project_Overview_and_Languages.pdf")
    pdf2 = os.path.join(os.getcwd(), "2_AuraCareer_Frontend_Tech_Stack.pdf")
    pdf3 = os.path.join(os.getcwd(), "3_AuraCareer_Backend_AI_and_DevOps_Stack.pdf")
    
    generate_pdf1(pdf1)
    generate_pdf2(pdf2)
    generate_pdf3(pdf3)
