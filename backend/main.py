import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

import github_service
import ai_service

# Load .env file FIRST before anything else
load_dotenv()

# Validate required environment variables on startup
REQUIRED_ENV_VARS = ["GROQ_API_KEY"]
for var in REQUIRED_ENV_VARS:
    if not os.getenv(var):
        raise RuntimeError(
            f"Missing required environment variable: {var}\n"
            f"Please create a .env file in the backend/ folder with {var}=your_key_here"
        )

app = FastAPI(title="GitHub Profile Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


@app.get("/")
def root():
    return {"status": "GitHub Profile Analyzer API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/analyze/{username}")
async def analyze(username: str):
    try:
        github_data = await github_service.fetch_profile(username)
        ai_result = await ai_service.analyze_profile(github_data)
        return {
            "status": "success",
            "analysis": {
                "profile": github_data.get("profile", {}),
                "top_languages": github_data.get("top_languages", []),
                "top_repositories": github_data.get("top_repositories", []),
                "contribution_streak": github_data.get("contribution_streak", {}),
                "ai_analysis": ai_result,
            },
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
        reply = await ai_service.generate_reply(request.message, history)
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"Error: {str(e)}"}
