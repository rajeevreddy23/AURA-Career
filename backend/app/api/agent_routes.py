from fastapi import APIRouter, Depends, HTTPException, Header, Request
from fastapi.responses import StreamingResponse
from ..agents.teacher_agent import TeacherAgent
from ..agents.curriculum_agent import CurriculumAgent
from ..agents.coding_agent import CodingAgent
from ..agents.voice_agent import VoiceAgent
from ..agents.memory_agent import MemoryAgent
from ..agents.translation_agent import TranslationAgent
from ..agents.analytics_agent import AnalyticsAgent
from ..agents.resume_agent import ResumeAgent
from ..core.security import verify_firebase_token, optional_firebase_token, rate_limit
from ..core.config import settings
from ..schemas.agent_schemas import (
    AgentRequest, AgentResponse, LessonRequest, DoubtRequest,
    CodeRequest, QuizRequest, ProjectRequest, TranslateRequest,
    GenerateRequest
)

router = APIRouter()

teacher = TeacherAgent()
curriculum = CurriculumAgent()
coder = CodingAgent()
voice = VoiceAgent()
memory = MemoryAgent()
translator = TranslationAgent()
analytics = AnalyticsAgent()
resume = ResumeAgent()

AGENTS = {
    "teacher": teacher,
    "coding": coder,
    "curriculum": curriculum,
    "memory": memory,
    "resume": resume,
    "analytics": analytics,
    "translation": translator,
    "voice": voice,
}

@router.post("/chat/{agent_type}")
async def chat_endpoint(agent_type: str, body: dict, user=Depends(optional_firebase_token)):
    """Generic ChatGPT-style SSE chat endpoint — one per surface, not per agent."""
    agent = AGENTS.get(agent_type)
    if agent is None:
        raise HTTPException(status_code=404, detail=f"Unknown agent type: {agent_type}")

    async def event_stream():
        try:
            async for chunk in agent.chat(
                body.get("message", ""),
                body.get("history", []),
                body.get("context"),
            ):
                yield f"data: {chunk}\n\n"
        except Exception as e:
            yield f"data: {str(e)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@router.post("/teach/lesson", response_model=AgentResponse)
async def teach_lesson(req: LessonRequest, user=Depends(verify_firebase_token)):
    try:
        data = await teacher.generate_lesson(req.topic, req.level)
        if req.language != "en":
            translated = await translator.translate_content(str(data), "en", req.language)
            data = translator.extract_json(translated)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/teach/doubt", response_model=AgentResponse)
async def resolve_doubt(req: DoubtRequest, user=Depends(verify_firebase_token)):
    try:
        data = await teacher.answer_doubt(req.question, req.lesson_context)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/curriculum/course", response_model=AgentResponse)
async def generate_course(req: LessonRequest, user=Depends(verify_firebase_token)):
    try:
        data = await curriculum.generate_course(req.topic, req.level)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/curriculum/quiz", response_model=AgentResponse)
async def generate_quiz(req: QuizRequest, user=Depends(verify_firebase_token)):
    try:
        data = await curriculum.generate_quiz(req.topic, req.num_questions)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/curriculum/project", response_model=AgentResponse)
async def generate_project(req: ProjectRequest, user=Depends(verify_firebase_token)):
    try:
        data = await curriculum.generate_project(req.topic, req.difficulty)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/explain", response_model=AgentResponse)
async def explain_code(req: CodeRequest, user=Depends(verify_firebase_token)):
    try:
        data = await coder.explain_code(req.code, req.language)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/generate", response_model=AgentResponse)
async def generate_code(req: CodeRequest, user=Depends(verify_firebase_token)):
    try:
        data = await coder.generate_code(req.code, req.language)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/debug", response_model=AgentResponse)
async def debug_code(req: CodeRequest, user=Depends(verify_firebase_token)):
    try:
        error = req.error or ""
        data = await coder.debug_code(req.code, error, req.language)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice/generate", response_model=AgentResponse)
async def generate_voice(req: dict, user=Depends(verify_firebase_token)):
    try:
        script = await voice.generate_lesson_script(req.get("topic", ""), req.get("duration", 5))
        return AgentResponse(success=True, data={"script": script})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/memory/analyze", response_model=AgentResponse)
async def analyze_student(data: dict, user=Depends(optional_firebase_token)):
    try:
        result = await memory.analyze_progress(data)
        return AgentResponse(success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate", response_model=AgentResponse)
async def translate_content(req: TranslateRequest, user=Depends(verify_firebase_token)):
    try:
        result = await translator.translate_content(req.content, req.source_language, req.target_language)
        return AgentResponse(success=True, data={"translated": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/report", response_model=AgentResponse)
async def generate_report(data: dict, user=Depends(verify_firebase_token)):
    try:
        result = await analytics.generate_report(data)
        return AgentResponse(success=True, data={"report": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def agents_status():
    """Which AI engine is active (NVIDIA / Groq / Gemini / mock)."""
    return {
        "success": True,
        "data": {
            "provider": teacher.active_provider,
            "models": {
                "nvidia": settings.nvidia_model if settings.nvidia_api_key else None,
                "groq": "llama-3.3-70b-versatile" if settings.groq_api_key else None,
                "gemini": "gemini-2.0-flash" if settings.gemini_api_key else None,
            },
        },
    }

@router.post("/resume/analyze")
async def resume_analyze(data: dict, request: Request):
    """Public resume analysis via ResumeAgent (ATS analyst + coach)."""
    ip = request.client.host if request.client else "unknown"
    if not await rate_limit(f"rate_limit:resume_analyze:{ip}", limit=10, window=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    resume_text = data.get("resume_text") or data.get("text", "")
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="No resume text provided.")
    result = await resume.analyze(resume_text)
    return {"success": True, "data": result}

@router.post("/resume/score")
async def resume_score(data: dict, user=Depends(verify_firebase_token)):
    """Match a resume against a target job description (ATS simulation)."""
    resume_text = data.get("resume_text", "")
    job_description = data.get("job_description", "")
    if not resume_text.strip() or not job_description.strip():
        raise HTTPException(status_code=400, detail="Both resume_text and job_description are required.")
    result = await resume.score_against_job(resume_text, job_description)
    return {"success": True, "data": result}

@router.post("/resume/improve")
async def resume_improve(data: dict, request: Request):
    """Rewrite or generate a resume section (public with rate limiting)."""
    ip = request.client.host if request.client else "unknown"
    if not await rate_limit(f"rate_limit:resume_improve:{ip}", limit=10, window=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    
    section = data.get("section", "")
    content = data.get("content", "")
    mode = data.get("mode", "improve")
    background = data.get("background", "")
    
    if not section or not content:
        raise HTTPException(status_code=400, detail="section and content are required")
    
    if mode == "improve":
        prompt = f"""Improve this {section} section of a resume. Make it ATS-friendly, professional, and impactful. Use strong action verbs and quantify achievements where possible. Return only the improved text, no extra commentary.

Section: {section}
Current content: {content}"""
    else:
        prompt = f"""Generate a professional {section} section for a resume based on this background description. Make it ATS-friendly. Return only the generated text, no extra commentary.

Section: {section}
Background: {background or content}"""
    
    result = await resume.generate(prompt)
    return {"success": True, "data": {"improved": result}}

@router.post("/public/ask")
async def public_ask(req: GenerateRequest, request: Request):
    """Public endpoint - no auth required. Ask the AI anything."""
    ip = request.client.host if request.client else "unknown"
    if not await rate_limit(f"rate_limit:public_ask:{ip}", limit=10, window=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    from ..agents.base import BaseAgent, RateLimitFallback
    agent = BaseAgent()
    # Force a strict general teaching prompt to avoid jailbreaks/injection
    agent.system_prompt = "You are a helpful education AI assistant. Provide concise, clear explanations."

    async def fallback(prompt):
        from ..agents.base import BaseAgent
        mock = BaseAgent()
        return mock._mock_response(prompt, "general")

    agent.set_fallback(fallback)
    try:
        result = await agent.generate(req.prompt)
        return {"success": True, "data": {"response": result}}
    except RateLimitFallback:
        result = await fallback(req.prompt)
        return {"success": True, "data": {"response": result}}

@router.post("/generate-lesson")
@router.post("/public/generate-lesson")
async def generate_lesson_endpoint(request: Request, body: dict = None):
    """1. Live Interactive Course & Multi-Slide Curriculum Generator"""
    if body is None:
        try:
            body = await request.json()
        except Exception:
            body = {}
    
    topic = body.get("topic") or request.query_params.get("topic") or "Python Data Structures"
    level = body.get("level") or request.query_params.get("level") or "Beginner"
    persona = body.get("persona") or request.query_params.get("persona") or "Professor Structured"

    course_data = await teacher.generate_multi_slide_course(topic=topic, level=level, persona=persona)
    return {"success": True, "data": course_data}

@router.post("/ask-professor")
@router.post("/public/ask-professor")
async def ask_professor_endpoint(request: Request, body: dict = None):
    """2. Live Class 'Ask Professor' & Voice Interaction Endpoint"""
    if body is None:
        try:
            body = await request.json()
        except Exception:
            body = {}

    persona = body.get("persona", "Professor Structured")
    course_title = body.get("courseTitle", "Interactive Masterclass")
    current_topic = body.get("currentTopic", "General Topic")
    current_slide = body.get("currentSlide", {})
    question = body.get("question", "")

    result = await teacher.ask_professor(
        persona=persona,
        course_title=course_title,
        current_topic=current_topic,
        current_slide=current_slide,
        question=question
    )
    return {"success": True, "data": result}

@router.post("/doubt")
@router.post("/public/doubt")
async def resolve_doubt_endpoint(request: Request, body: dict = None):
    """3. AI Doubt Resolver & Step-by-Step Breakdown Endpoint"""
    if body is None:
        try:
            body = await request.json()
        except Exception:
            body = {}

    topic = body.get("topic", "Programming")
    level = body.get("level", "Beginner")
    doubt = body.get("doubt", "")

    result = await teacher.resolve_doubt_deep(topic=topic, level=level, doubt=doubt)
    return {"success": True, "data": result}

@router.post("/coding-challenge")
@router.post("/public/coding-challenge")
async def coding_challenge_endpoint(request: Request, body: dict = None):
    """4. Interactive Live Sandbox & Coding Lab Challenge Generator"""
    if body is None:
        try:
            body = await request.json()
        except Exception:
            body = {}

    current_topic = body.get("currentTopic") or body.get("topic") or "Python Algorithms"
    result = await teacher.generate_coding_challenge(current_topic=current_topic)
    return {"success": True, "data": result}

@router.post("/generate/stream")
async def generate_stream(req: GenerateRequest, user=Depends(optional_firebase_token)):
    from ..agents.base import BaseAgent
    agent = BaseAgent()
    agent.system_prompt = req.system_prompt or ""
    return StreamingResponse(
        agent.generate_stream(req.prompt),
        media_type="text/event-stream"
    )

