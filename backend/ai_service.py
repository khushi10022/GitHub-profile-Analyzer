import json
import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from groq import Groq


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not set in the environment.")

client = Groq(api_key=GROQ_API_KEY)

# Updated model — llama3-70b-8192 was decommissioned
MODEL_NAME = "llama-3.3-70b-versatile"


async def analyze_profile(github_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Use Groq to analyze a GitHub profile dictionary and return structured insights.
    """
    prompt = (
        "You are a GitHub growth and developer portfolio expert.\n"
        "You will be given structured GitHub profile data as JSON. "
        "Analyze it and respond ONLY with a JSON object, no extra text.\n\n"
        "The JSON must have exactly these keys:\n"
        '- "overall_score": number (0-10, can be fractional)\n'
        '- "top_strengths": array of 3 strings\n'
        '- "top_improvements": array of 3 strings\n'
        '- "career_insights": string\n'
        '- "weekly_tip": string\n\n'
        "Consider: repo activity, stars, languages, description quality, profile completeness, "
        "consistency of contributions, and signals that help hiring managers or OSS maintainers.\n\n"
        "Here is the GitHub data JSON:\n"
        f"{json.dumps(github_data, ensure_ascii=False)}"
    )

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise GitHub growth analyst. "
                        "Always return machine-readable JSON exactly matching the requested schema. "
                        "Return ONLY valid JSON with no markdown, no backticks, no extra text."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=800,
        )
    except Exception as exc:
        raise RuntimeError(f"Groq API request failed for analyze_profile: {exc}") from exc

    text = completion.choices[0].message.content if completion.choices else ""

    # Strip markdown code blocks if present
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]) if len(lines) > 2 else text

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        # Try to extract JSON from the response
        import re
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group())
            except Exception:
                raise RuntimeError(f"Failed to parse Groq profile analysis as JSON: {exc}") from exc
        else:
            raise RuntimeError(f"Failed to parse Groq profile analysis as JSON: {exc}") from exc

    result: Dict[str, Any] = {
        "overall_score": data.get("overall_score", 0),
        "top_strengths": data.get("top_strengths", []),
        "top_improvements": data.get("top_improvements", []),
        "career_insights": data.get("career_insights", ""),
        "weekly_tip": data.get("weekly_tip", ""),
    }
    return result


def _normalize_history(
    message: str,
    history: Optional[List[Any]] = None,
) -> List[Dict[str, str]]:
    """
    Convert history into Groq chat messages format.
    Handles both dict and Pydantic model formats.
    """
    messages: List[Dict[str, str]] = []

    for item in history or []:
        # Handle both dict and object with attributes
        if isinstance(item, dict):
            role = item.get("role", "user")
            content = item.get("content", "")
        else:
            role = getattr(item, "role", "user")
            content = getattr(item, "content", "")

        if not content:
            continue

        messages.append({
            "role": "assistant" if role == "assistant" else "user",
            "content": str(content),
        })

    # Append current user message
    messages.append({
        "role": "user",
        "content": message,
    })
    return messages


async def chat_response(message: str, history: Optional[List[Any]] = None) -> str:
    """
    Use Groq as a GitHub growth assistant to answer chat questions.
    """
    if not message.strip():
        raise ValueError("Message cannot be empty.")

    messages = _normalize_history(message, history)

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert GitHub growth assistant who helps developers improve their GitHub profile, "
                        "contributions, and open source presence.\n"
                        "- Give specific, actionable advice.\n"
                        "- Be encouraging but honest.\n"
                        "- Reference concrete profile elements when possible (repos, languages, activity).\n"
                        "- Keep responses concise and helpful — 2-4 sentences max unless more detail is needed.\n"
                        "- Focus on practical steps the user can take immediately."
                    ),
                },
                *messages,
            ],
            temperature=0.5,
            max_tokens=600,
        )
    except Exception as exc:
        raise RuntimeError(f"Groq API request failed for chat_response: {exc}") from exc

    text = completion.choices[0].message.content if completion.choices else ""
    return (text or "").strip()


async def generate_reply(message: str, history: Optional[List[Any]] = None) -> str:
    """
    Compatibility wrapper used by the FastAPI /chat endpoint.
    """
    return await chat_response(message=message, history=history)


async def compare_profiles(profile1: Dict[str, Any], profile2: Dict[str, Any]) -> Dict[str, Any]:
    """
    Use Groq to compare two GitHub profiles and return detailed insights, reasons, and suggestions.
    """
    prompt = (
        "You are an expert GitHub profile analyzer and technical recruiter.\n"
        "You will be given two GitHub profiles in JSON format. "
        "Compare them and respond ONLY with a JSON object, no extra text.\n\n"
        "The JSON must have exactly these keys:\n"
        '- "detailed_comparison": string (a comprehensive paragraph comparing their strengths, activities, and overall impact)\n'
        '- "winner_reason": string (a short explanation of why one profile might be considered stronger or more appealing to recruiters)\n'
        '- "suggestions_user1": array of 2 strings (actionable tips for the first user to improve their profile compared to the second)\n'
        '- "suggestions_user2": array of 2 strings (actionable tips for the second user to improve their profile compared to the first)\n\n'
        "Here is the data for Profile 1:\n"
        f"{json.dumps(profile1, ensure_ascii=False)}\n\n"
        "Here is the data for Profile 2:\n"
        f"{json.dumps(profile2, ensure_ascii=False)}"
    )

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise GitHub growth analyst. "
                        "Always return machine-readable JSON exactly matching the requested schema. "
                        "Return ONLY valid JSON with no markdown, no backticks, no extra text."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=800,
        )
    except Exception as exc:
        raise RuntimeError(f"Groq API request failed for compare_profiles: {exc}") from exc

    text = completion.choices[0].message.content if completion.choices else ""

    # Strip markdown code blocks if present
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]) if len(lines) > 2 else text

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        # Try to extract JSON from the response
        import re
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group())
            except Exception:
                raise RuntimeError(f"Failed to parse Groq comparison analysis as JSON: {exc}") from exc
        else:
            raise RuntimeError(f"Failed to parse Groq comparison analysis as JSON: {exc}") from exc

    result: Dict[str, Any] = {
        "detailed_comparison": data.get("detailed_comparison", "Unable to generate detailed comparison."),
        "winner_reason": data.get("winner_reason", "Unable to determine winner reason."),
        "suggestions_user1": data.get("suggestions_user1", ["Keep contributing out there!"]),
        "suggestions_user2": data.get("suggestions_user2", ["Keep building cool projects!"])
    }
    return result