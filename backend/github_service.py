import os
from collections import Counter
from datetime import datetime, timezone
from typing import Any, Dict, List

import httpx
from dotenv import load_dotenv


load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_API_BASE = "https://api.github.com"


class UserNotFoundError(Exception):
  ...


def _auth_headers() -> Dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "github-profile-analyzer",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


async def _fetch_json(client: httpx.AsyncClient, url: str) -> Any:
    response = await client.get(url, headers=_auth_headers(), timeout=20)

    if response.status_code == 404:
        raise UserNotFoundError("GitHub user not found")

    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise RuntimeError(f"GitHub API request failed: {exc}") from exc

    return response.json()


async def get_github_profile(username: str) -> Dict[str, Any]:
    """
    Fetch a GitHub user's profile and repository analytics.
    """
    if not username:
        raise ValueError("Username is required")

    async with httpx.AsyncClient(base_url=GITHUB_API_BASE) as client:
        user_data = await _fetch_json(client, f"/users/{username}")
        repos_data: List[Dict[str, Any]] = await _fetch_json(client, f"/users/{username}/repos?per_page=100")

    # Basic profile info
    profile = {
        "username": user_data.get("login"),
        "name": user_data.get("name"),
        "bio": user_data.get("bio"),
        "avatar_url": user_data.get("avatar_url"),
        "followers": user_data.get("followers", 0),
        "following": user_data.get("following", 0),
        "location": user_data.get("location"),
        "blog": user_data.get("blog"),
        "company": user_data.get("company"),
        "public_repos": user_data.get("public_repos", 0),
        "public_gists": user_data.get("public_gists", 0),
        "created_at": user_data.get("created_at"),
    }

    # Normalize repositories list
    repos: List[Dict[str, Any]] = []
    total_stars = 0
    total_forks = 0
    total_watchers = 0
    language_counter: Counter[str] = Counter()

    for repo in repos_data:
        name = repo.get("name")
        stars = int(repo.get("stargazers_count", 0) or 0)
        forks = int(repo.get("forks_count", 0) or 0)
        watchers = int(repo.get("watchers_count", 0) or 0)
        description = repo.get("description")
        language = repo.get("language")

        repos.append(
            {
                "name": name,
                "stars": stars,
                "forks": forks,
                "watchers": watchers,
                "description": description,
                "language": language,
            }
        )

        total_stars += stars
        total_forks += forks
        total_watchers += watchers
        if language:
            language_counter[language] += 1

    # Top 5 repositories by stars
    top_repositories = sorted(repos, key=lambda r: r["stars"], reverse=True)[:5]

    # Top 3 repositories by forks
    top_forked_repositories = sorted(repos, key=lambda r: r["forks"], reverse=True)[:3]

    # Language usage percentages
    language_stats: List[Dict[str, Any]] = []
    total_language_count = sum(language_counter.values())
    if total_language_count > 0:
        for lang, count in language_counter.most_common():
            percentage = round((count / total_language_count) * 100, 2)
            language_stats.append(
                {
                    "language": lang,
                    "count": count,
                    "percentage": percentage,
                }
            )

    # Account age and profile completeness
    created_at = profile.get("created_at")
    account_age_years = 0.0
    if created_at:
        try:
            created_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            # approximate age in years
            delta_years = (now - created_dt).days / 365.25
            account_age_years = round(delta_years, 2)
            profile["created_at_human"] = created_dt.strftime("%Y-%m-%d")
        except ValueError:
            # Keep the original string if parsing fails
            pass

    has_bio = bool(profile.get("bio"))
    has_avatar = bool(profile.get("avatar_url"))
    has_location = bool(profile.get("location"))
    has_blog = bool(profile.get("blog"))
    has_company = bool(profile.get("company"))

    completeness_flags = [has_bio, has_avatar, has_location, has_blog, has_company]
    completeness_score = int(sum(1 for flag in completeness_flags if flag))
    completeness_percentage = int((completeness_score / len(completeness_flags)) * 100)

    unique_languages = sorted(language_counter.keys())

    result: Dict[str, Any] = {
        "profile": {
            **profile,
            "account_age_years": account_age_years,
            "profile_completeness_score": completeness_score,
            "profile_completeness_percentage": completeness_percentage,
            "profile_completeness": {
                "has_bio": has_bio,
                "has_avatar": has_avatar,
                "has_location": has_location,
                "has_blog": has_blog,
                "has_company": has_company,
            },
        },
        "repositories": repos,
        "top_repositories": top_repositories,
        "top_forked_repositories": top_forked_repositories,
        "top_languages": language_stats,
        "unique_languages": unique_languages,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "total_watchers": total_watchers,
        "public_gists": profile.get("public_gists", 0),
    }

    return result


async def analyze_user(username: str) -> Dict[str, Any]:
    """
    Convenience wrapper used by the FastAPI layer.
    """
    return await get_github_profile(username)

