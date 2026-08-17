<div align="center">

# 🌟 AURA Career 🌟
### *Next-Generation AI-Powered Interactive Career & Learning Platform*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.0_Flash-8E44AD?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> **AURA Career** is an end-to-end AI platform featuring an **AI Resume Analyzer**, **Live Multi-Slide Classroom**, **Dynamic AI Teacher Persona Transformation**, **Interactive Coding Lab Sandbox**, and **AI-Driven Skill Matching**.

<br/>

[🚀 Launch Demo](#-quick-start) • [⚡ AI Features](#-core-ai-features) • [🤖 AI Teachers](#-dynamic-ai-teacher-personas) • [🛠️ Tech Stack](#%EF%B8%8F-tech-stack) • [📄 License](#-license)

---

</div>

<br/>

## 🎯 Platform Highlights

```
+-----------------------------------------------------------------------------------+
|                            AURA CAREER & LEARN ECOSYSTEM                         |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ 📄 AI Resume Analyzer ] ----> ATS Score (0-100) + Keyword Audit + Job Matches   |
|                                                                                   |
|  [ 🤖 Dynamic AI Avatar  ] ----> 5 Persona Themes (Professor, Coach, Friend...)   |
|                                                                                   |
|  [ 🎓 Live AI Classroom  ] ----> Multi-Slide Lessons + Speech TTS + Voice Mic     |
|                                                                                   |
|  [ 💻 Coding Lab Sandbox ] ----> Real-time Code Execution + Edge Test Cases       |
|                                                                                   |
|  [ ❓ Doubt Resolution   ] ----> Instant Diagnostic AI Mentorship & Fixes          |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## ⚡ Core AI Features

### 📄 1. AI Resume Analyzer & ATS Scanner
- 📥 **PDF Upload & Text Extraction**: Drag-and-drop or select any readable PDF resume using client-side `pdfjs-dist` text parsing.
- 🎯 **Job Target Context**: Paste targeted job descriptions or select specific target roles (*Full Stack Developer, Data Scientist, ML Engineer, DevOps*).
- ⭕ **Animated ATS Score Gauge**: Real-time circular progress ring (0–100) with ATS Verdict badges (`Excellent`, `Good`, `Needs Work`).
- 📊 **Detailed Criteria Breakdown**: Horizontal progress bars for 5 key ATS metrics:
  - *Format & Structure*
  - *Content Relevance*
  - *Keyword Matching*
  - *Skills Coverage*
  - *Experience Impact*
- 🏷️ **Color-Coded Keyword Chips**: Instant visual legend:
  - 🟢 **Matched Keywords** (Green)
  - 🟡 **Partially Matched Keywords** (Yellow)
  - 🔴 **Missing Keywords** (Red)
- 💡 **Section-Linked Improvement Suggestions**: Actionable advice cards tagged by section (*Experience*, *Skills*, *Summary*, *Formatting*).
- 💼 **Matched Job Opportunities**: Scrollable carousel showing company avatars, job titles, locations, and match percentages.

---

### 🤖 2. Dynamic AI Teacher Avatars & Persona Transformation
The live classroom robot avatar dynamically shifts its visual theme, eye color glow, chest emblem, and teaching persona in real-time based on the student's selected instructor:

| AI Teacher Persona | Title & Focus | Visual Theme | Chest Emblem Badge | Eye & Ring Glow |
| :--- | :--- | :--- | :--- | :--- |
| **🎓 Professor** | *The Classic Educator* | Royal Indigo (`#a855f7`) | Mortarboard Cap | Deep Purple Glow |
| **⚡ Coach** | *The Motivational Mentor* | Energetic Amber (`#f59e0b`) | Lightning Bolt Zap | Solar Gold Glow |
| **💖 Friend** | *The Friendly Guide* | Warm Rose (`#ec4899`) | Glowing Heart | Pink Rose Glow |
| **🧠 Expert** | *The Industry Veteran* | Deep Violet (`#8b5cf6`) | Diamond Circuit Node | Electric Violet Glow |
| **📘 Simplifier** | *The Clear Explainer* | Cyan Teal (`#06b6d4`) | Lightbulb / Book | Cyan Crystal Glow |

---

### 🎓 3. Live Interactive Classroom
- 🔄 **In-Page AI Teacher Switcher**: Change your AI Teacher style directly inside the live class **without losing current slide, code, or notes matter**!
- 🎙️ **Voice Mode & Speech Recognition**: Talk directly to the AI Professor using browser Speech-To-Text and listen via Text-To-Speech (TTS).
- 🖥️ **Interactive Code Blackboard**: Live code syntax highlighting, CPython execution output emulator, and visual data structure diagrams.
- 🚪 **Clean Exit Controls**: In-page exit modal options for seamless navigation to Dashboard or Course Catalog.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router) & React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS
- **Animations**: Framer Motion & CSS Micro-Interactions
- **Icons**: Lucide React
- **PDF Parsing**: `pdfjs-dist`

### **AI & API Backend**
- **LLM Engine**: Google Gemini 2.0 Flash (`generativelanguage.googleapis.com`)
- **API Proxy Routes**: Next.js Serverless API Routes & Python FastAPI
- **Fallback Engine**: Local context-aware heuristic AI scoring & fallback generators

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/rajeevreddy23/AURA-Career.git
cd AURA-Career
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 📂 Project Structure

```
AURA-Career/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── resume/analyze/      # AI Resume ATS Engine
│   │   │   ├── resume/chat/         # AI Career Assistant
│   │   │   ├── ask-professor/       # Live AI Tutoring
│   │   │   ├── doubt/               # Technical Doubt Resolver
│   │   │   └── generate-lesson/     # Multi-Slide Lesson Generator
│   │   ├── classroom/               # Live Multi-Slide Classroom
│   │   ├── resume-hub/              # AI Resume Analyzer Hub
│   │   └── select-teacher/          # AI Teacher Persona Selector
│   ├── components/
│   │   ├── classroom/
│   │   │   ├── AIProfessorAvatar.tsx # Dynamic Robot Avatar
│   │   │   ├── TeacherSelectModal.tsx # In-Page Teacher Switcher
│   │   │   └── ExitClassModal.tsx    # Clean Exit Modal
│   │   └── resume/
│   │       └── AnalyzeResume.tsx    # Resume Analyzer UI
│   └── lib/
│       ├── pdfParser.ts             # Client-side PDF Parser
│       └── constants/               # Teacher Styles & Course Data
├── .env.local
└── package.json
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with ❤️ by the AURA Team</sub>
</div>
