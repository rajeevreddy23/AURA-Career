from fastapi import APIRouter
from .agent_routes import router as agent_router
from .course_routes import router as course_router
from .user_routes import router as user_router
from .websocket_routes import router as ws_router

router = APIRouter()
router.include_router(agent_router, prefix="/agents", tags=["AI Agents"])
router.include_router(course_router, prefix="/courses", tags=["Courses"])
router.include_router(user_router, prefix="/users", tags=["Users"])
router.include_router(ws_router, prefix="/ws", tags=["WebSocket"])
