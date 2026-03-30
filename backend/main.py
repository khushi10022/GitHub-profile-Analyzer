from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import github_service
import ai_service


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None


class CompareRequest(BaseModel):
    username1: str
    username2: str

app = FastAPI(title="GitHub Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}


@app.get("/analyze/{username}")
async def analyze_profile(username: str) -> dict:
    """
    Analyze a GitHub profile by username using the github_service module.
    """
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")

    try:
        profile_summary = await github_service.analyze_user(username)
    except github_service.UserNotFoundError:
        raise HTTPException(status_code=404, detail="GitHub user not found.")
    except Exception as exc:  # pragma: no cover - generic safety net
        raise HTTPException(status_code=500, detail="Failed to analyze GitHub profile.") from exc

    return {"username": username, "analysis": profile_summary}


@app.post("/chat")
async def chat_with_assistant(payload: ChatRequest) -> dict:
    """
    Chat endpoint that forwards the latest user message and conversation
    history to the AI service.
    """
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    history = payload.history or []

    try:
        reply = await ai_service.generate_reply(message=payload.message, history=history)
    except Exception as exc:  # pragma: no cover - generic safety net
        raise HTTPException(status_code=500, detail="Failed to generate AI reply.") from exc

    return {
        "reply": reply,
    }


@app.post("/compare")
async def compare_profiles(payload: CompareRequest) -> dict:
    """
    Compare two GitHub profiles and return both raw data and AI-generated growth tips.
    """
    username1 = payload.username1.strip()
    username2 = payload.username2.strip()

    if not username1 or not username2:
        raise HTTPException(status_code=400, detail="Both username1 and username2 are required.")

    try:
        profile1 = await github_service.analyze_user(username1)
    except github_service.UserNotFoundError:
        raise HTTPException(status_code=404, detail=f"GitHub user '{username1}' not found.")
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Failed to analyze GitHub profile '{username1}'.") from exc

    try:
        profile2 = await github_service.analyze_user(username2)
    except github_service.UserNotFoundError:
        raise HTTPException(status_code=404, detail=f"GitHub user '{username2}' not found.")
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Failed to analyze GitHub profile '{username2}'.") from exc

    try:
        comparison = await ai_service.compare_profiles(profile1, profile2)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail="Failed to generate AI comparison.") from exc

    return {
        "profile1": {"username": username1, "analysis": profile1},
        "profile2": {"username": username2, "analysis": profile2},
        "comparison": comparison,
    }


@app.get("/")
async def root() -> dict:
    return {"message": "GitHub Analyzer backend is running."}
