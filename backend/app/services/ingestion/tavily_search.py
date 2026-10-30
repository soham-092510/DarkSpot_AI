from typing import List, Dict, Any, Optional
import httpx
from backend.app.core.config import settings


def search_web_sources(
    query: str,
    max_results: int = 5,
    api_key: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Searches the live web using the Tavily Search API.
    Supports user's Bring-Your-Own-Key (BYOK) with fallback to environment key.
    Returns list of source dictionaries with url, title, snippet.
    """
    effective_key = api_key or settings.TAVILY_API_KEY
    if not effective_key:
        # Gracefully return empty when API key is not configured
        return []

    url = "https://api.tavily.com/search"
    payload = {
        "api_key": effective_key,
        "query": query,
        "search_depth": "basic",
        "include_answer": False,
        "max_results": min(max_results, 8),
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("results", []):
                    results.append({
                        "url": item.get("url"),
                        "title": item.get("title", "Untitled Source"),
                        "snippet": item.get("content", ""),
                    })
                return results
            else:
                return []
    except Exception:
        return []
