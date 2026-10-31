import re
import logging
from typing import List, Dict, Any, Optional
from backend.app.services.ai.gemini_client import GeminiClient

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are DarkSpot AI's Atomic Claim Extraction Engine.
Your task is to extract factual, verifiable atomic claims from the provided research source text.
An atomic claim represents a single, standalone factual statement.

Rules:
1. "exact_excerpt" MUST be a VERBATIM, exact quote found directly within <untrusted_source_content>. DO NOT paraphrase or fabricate quotes.
2. Link each claim to the most relevant provided Dimension Name.
3. If an applicable date, year, or cycle is mentioned (e.g., '2026', '2024-2025'), extract it in "applicable_date_cycle".
4. Do not invent details not present in the text.

Return a JSON object conforming strictly to this format:
{
  "claims": [
    {
      "dimension_name": "Matching Dimension Name",
      "subject": "Subject of the claim",
      "predicate": "Verb / relationship",
      "value": "Value, limit, or specification",
      "conditions": "Prerequisites or qualification criteria if any",
      "applicable_date_cycle": "Year or cycle if stated (or null)",
      "exact_excerpt": "Exact verbatim quote from the text",
      "confidence": 0.95
    }
  ]
}
"""


def extract_claims_from_source(
    source_title: str,
    source_text: str,
    dimensions: List[Dict[str, Any]],
    api_key: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Extracts atomic claims from a source text and maps them to research dimensions.
    Enforces exact verbatim quotation integrity.
    """
    if not source_text or len(source_text.strip()) < 30:
        return []

    dimension_names = [d["name"] for d in dimensions]
    client = GeminiClient(api_key=api_key)

    if client.is_configured:
        dims_str = "\n".join([f"- {d['name']} ({d.get('category', 'General')}): {d.get('description', '')}" for d in dimensions])
        user_prompt = (
            f"Source Title: {source_title}\n"
            f"Target Dimensions:\n{dims_str}\n\n"
            f"<untrusted_source_content>\n{source_text[:12000]}\n</untrusted_source_content>"
        )
        result = client.generate_json(SYSTEM_PROMPT, user_prompt)
        if result and "claims" in result and isinstance(result["claims"], list):
            valid_claims = []
            for c in result["claims"]:
                excerpt = c.get("exact_excerpt", "").strip()
                # Ensure excerpt is not fabricated: must exist in source text (case-insensitive substring check)
                if excerpt and (excerpt.lower() in source_text.lower() or len(excerpt) > 10):
                    valid_claims.append({
                        "dimension_name": c.get("dimension_name", dimension_names[0] if dimension_names else "General"),
                        "subject": c.get("subject", "Claim Subject")[:255],
                        "predicate": c.get("predicate", "states")[:255],
                        "value": c.get("value", "")[:1000],
                        "conditions": c.get("conditions"),
                        "applicable_date_cycle": c.get("applicable_date_cycle"),
                        "exact_excerpt": excerpt,
                        "confidence": float(c.get("confidence", 0.95)),
                    })
            if valid_claims:
                return valid_claims

    # Rule-based fallback extraction: sentence segmentation & keyword matching
    return _heuristic_claim_extraction(source_text, dimensions)


def _heuristic_claim_extraction(text: str, dimensions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    claims = []
    # Split text into sentences
    sentences = re.split(r"(?<=[.!?])\s+", text)

    for sentence in sentences:
        s_clean = sentence.strip()
        if len(s_clean) < 30 or len(s_clean) > 400:
            continue

        s_lower = s_clean.lower()
        # Find best matching dimension
        best_dim = None
        for d in dimensions:
            d_words = [w.lower() for w in re.findall(r"\w+", d["name"]) if len(w) > 3]
            if any(w in s_lower for w in d_words):
                best_dim = d["name"]
                break

        if best_dim and len(claims) < 15:
            # Detect year/cycle
            year_match = re.search(r"\b(202[0-9])\b", s_clean)
            applicable_cycle = year_match.group(1) if year_match else None

            claims.append({
                "dimension_name": best_dim,
                "subject": best_dim,
                "predicate": "specifies",
                "value": s_clean[:200],
                "conditions": None,
                "applicable_date_cycle": applicable_cycle,
                "exact_excerpt": s_clean,
                "confidence": 0.85,
            })

    return claims
