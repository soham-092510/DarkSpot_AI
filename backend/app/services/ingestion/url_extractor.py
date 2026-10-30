import re
import hashlib
from typing import Dict, Any, Optional
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
import trafilatura

from backend.app.core.security import is_safe_url
from backend.app.core.config import settings


def extract_content_from_url(url: str) -> Dict[str, Any]:
    """
    Safely fetches and extracts structured text, title, publication date, and domain
    from a user-provided or search-provided URL.
    Enforces SSRF prevention and size limits.
    """
    is_safe, error_msg = is_safe_url(url)
    if not is_safe:
        return {
            "status": "failed",
            "error": f"SSRF Guard: {error_msg}",
            "clean_text": "",
            "raw_text": "",
            "title": "Blocked URL",
            "publisher_domain": urlparse(url).netloc or "Unknown",
            "publication_date": None,
            "content_hash": None,
        }

    domain = urlparse(url).netloc.lower()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 DarkSpotAI/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        with httpx.Client(
            timeout=settings.REQUEST_TIMEOUT_SECONDS,
            follow_redirects=True,
            max_redirects=3,
            verify=True
        ) as client:
            resp = client.get(url, headers=headers)
            # Re-verify final redirect URL
            final_safe, final_err = is_safe_url(str(resp.url))
            if not final_safe:
                return {
                    "status": "failed",
                    "error": f"SSRF Guard (Redirect): {final_err}",
                    "clean_text": "",
                    "raw_text": "",
                    "title": "Blocked Redirect",
                    "publisher_domain": domain,
                    "publication_date": None,
                    "content_hash": None,
                }

            if resp.status_code >= 400:
                return {
                    "status": "failed",
                    "error": f"HTTP {resp.status_code}: Unable to access resource",
                    "clean_text": "",
                    "raw_text": "",
                    "title": "Access Error",
                    "publisher_domain": domain,
                    "publication_date": None,
                    "content_hash": None,
                }

            html = resp.text

    except httpx.TimeoutException:
        return {
            "status": "failed",
            "error": "Connection timed out while fetching webpage",
            "clean_text": "",
            "raw_text": "",
            "title": "Timeout",
            "publisher_domain": domain,
            "publication_date": None,
            "content_hash": None,
        }
    except Exception as e:
        return {
            "status": "failed",
            "error": f"Network extraction failure: {str(e)}",
            "clean_text": "",
            "raw_text": "",
            "title": "Extraction Failed",
            "publisher_domain": domain,
            "publication_date": None,
            "content_hash": None,
        }

    # Extract clean text using trafilatura
    clean_text = trafilatura.extract(
        html,
        include_links=False,
        include_images=False,
        include_tables=True,
        output_format="txt"
    )

    # Fallback to BeautifulSoup if trafilatura extracted insufficient text
    title = ""
    pub_date: Optional[str] = None
    soup = BeautifulSoup(html, "html.parser")

    # Title extraction
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    elif soup.find("h1"):
        title = soup.find("h1").get_text().strip()
    if not title:
        title = domain

    # Publication date extraction from metadata
    meta_date = (
        soup.find("meta", property="article:published_time")
        or soup.find("meta", attrs={"name": "publication_date"})
        or soup.find("meta", attrs={"name": "date"})
        or soup.find("meta", attrs={"name": "pubdate"})
        or soup.find("time")
    )
    if meta_date:
        pub_date = meta_date.get("content") or meta_date.get("datetime") or meta_date.get_text()
        if pub_date:
            pub_date = pub_date.strip()[:20]

    # Date regex fallback in text if header/meta not present (e.g. "Published on October 15, 2024")
    if not pub_date:
        match = re.search(r"(?:published|updated|date|notice)[:\s]+([A-Za-z]+ \d{1,2}, \d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{4})", html, re.IGNORECASE)
        if match:
            pub_date = match.group(1).strip()

    if not clean_text or len(clean_text) < 100:
        # Strip script/style tags and grab text
        for s in soup(["script", "style", "nav", "footer", "header"]):
            s.decompose()
        clean_text = soup.get_text(separator="\n", strip=True)

    # Sanitize and truncate to safe processing size
    clean_text = clean_text[:50000] if clean_text else ""
    content_hash = hashlib.sha256(clean_text.encode("utf-8")).hexdigest() if clean_text else None

    return {
        "status": "extracted" if len(clean_text) > 50 else "failed",
        "error": None if len(clean_text) > 50 else "Insufficient readable text extracted from source",
        "clean_text": clean_text,
        "raw_text": html[:50000],
        "title": title[:300],
        "publisher_domain": domain,
        "publication_date": pub_date,
        "content_hash": content_hash,
    }
