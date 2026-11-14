"""Regression coverage for multi-turn context at the public teacher endpoint."""
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest


@pytest.mark.asyncio
@pytest.mark.parametrize("history, expected", [
    ([{"role": "user", "content": "I confused tuples with lists"}], [{"role": "user", "content": "I confused tuples with lists"}]),
    ("malformed", []),
])
async def test_teacher_route_forwards_valid_history(monkeypatch, history, expected):
    from backend.app.api import agent_routes

    answer = AsyncMock(return_value={"answer": "A tuple has fixed slots."})
    monkeypatch.setattr(agent_routes, "teacher", SimpleNamespace(ask_professor=answer))
    result = await agent_routes.ask_professor_endpoint(MagicMock(), {
        "question": "Can the list inside a tuple change?",
        "history": history,
        "currentSlide": {"title": "Tuples"},
    })
    assert result["success"] is True
    assert answer.await_args.kwargs["chat_history"] == expected
    assert answer.await_args.kwargs["current_slide"] == {"title": "Tuples"}
