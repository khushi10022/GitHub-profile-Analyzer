import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

import github_service
import ai_service
import payment_service

load_dotenv()

for var in ["GROQ_API_KEY"]:
    if not os.getenv(var):
        raise RuntimeError(f"Missing required environment variable: {var}. Create backend/.env file.")

app = FastAPI(title="GitHub Profile Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
    ],
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


class OrderRequest(BaseModel):
    plan_id: str


class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: str


@app.get("/")
def root():
    return {"status": "GitHub Profile Analyzer API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/analyze/{username}")
async def analyze(username: str):
    try:
        github_data = await github_service.analyze_user(username)
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


@app.post("/create-order")
def create_order(req: OrderRequest):
    try:
        order = payment_service.create_order(req.plan_id)
        return order
    except Exception as e:
        return {"error": str(e)}


@app.post("/verify-payment")
def verify_payment(req: VerifyRequest):
    if req.razorpay_order_id.startswith("demo_"):
        return {"success": True, "plan_id": req.plan_id}
    verified = payment_service.verify_payment(
        req.razorpay_order_id,
        req.razorpay_payment_id,
        req.razorpay_signature,
    )
    if verified:
        return {"success": True, "plan_id": req.plan_id}
    return {"success": False, "error": "Payment verification failed"}