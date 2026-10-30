import logging
from typing import List, Dict, Any, Tuple
from backend.app.services.ai.gemini_client import GeminiClient

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are DarkSpot AI's Contradiction & Cross-Source Comparison Engine.
Your task is to analyze claims from different sources mapped to the same research dimension and detect potential contradictions.

Rules:
1. Distinguish between a GENUINE CONTRADICTION (incompatible requirements, differing numerical values for the same cycle) and a CONTEXTUAL DIFFERENCE (different geographic regions, distinct applicant categories, or differing academic years).
2. If context differs, explain the contextual nuance rather than falsely declaring a contradiction.
3. Every finding MUST cite the exact excerpts from Source A and Source B.

Return a JSON object conforming strictly to this format:
{
  "conflicts": [
    {
      "dimension_name": "Dimension Name",
      "title": "Clear contradiction title",
      "severity": "CRITICAL", // CRITICAL, HIGH, MEDIUM
      "is_genuine_conflict": true,
      "context_difference_reason": "null if genuine conflict, or explanation if contextual",
      "explanation": "Why these two claims conflict or differ",
      "claim_a_excerpt": "Exact quote from Source A",
      "claim_b_excerpt": "Exact quote from Source B",
      "why_it_matters": "Risk to the user of following the wrong claim",
      "recommended_action": "How to resolve the contradiction"
    }
  ]
}
"""


def detect_cross_source_conflicts(
    dimensions: List[Dict[str, Any]],
    claims: List[Dict[str, Any]],
    sources_map: Dict[str, Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Compares claims across distinct sources within each dimension to identify potential contradictions.
    Returns (updated_dimensions, conflict_findings).
    """
    # Group claims by dimension
    claims_by_dim: Dict[str, List[Dict[str, Any]]] = {}
    for c in claims:
        dname = c.get("dimension_name", "General")
        claims_by_dim.setdefault(dname, []).append(c)

    conflict_findings = []
    conflicted_dim_names = set()

    client = GeminiClient()

    for dim in dimensions:
        dname = dim["name"]
        dim_claims = claims_by_dim.get(dname, [])

        # Only check conflicts if we have claims from at least 2 distinct sources
        distinct_source_ids = set(c.get("source_id") for c in dim_claims if c.get("source_id"))
        if len(distinct_source_ids) < 2:
            continue

        if client.is_configured:
            claims_text = []
            for i, c in enumerate(dim_claims):
                s_id = c.get("source_id")
                s_info = sources_map.get(s_id, {})
                s_title = s_info.get("title", f"Source {i+1}")
                s_date = s_info.get("publication_date", "Date unstated")
                claims_text.append(
                    f"Claim {i+1} from '{s_title}' (Pub Date: {s_date}, Cycle: {c.get('applicable_date_cycle')}):\n"
                    f"- Subject: {c.get('subject')}\n"
                    f"- Value: {c.get('value')}\n"
                    f"- Conditions: {c.get('conditions')}\n"
                    f"- Exact Excerpt: \"{c.get('exact_excerpt')}\""
                )

            user_prompt = (
                f"Dimension: {dname}\n\n"
                f"Compare the following claims from distinct sources:\n\n"
                + "\n\n".join(claims_text)
            )

            res = client.generate_json(SYSTEM_PROMPT, user_prompt)
            if res and "conflicts" in res and isinstance(res["conflicts"], list):
                for conf in res["conflicts"]:
                    is_genuine = conf.get("is_genuine_conflict", True)
                    conflicted_dim_names.add(dname)
                    conflict_findings.append({
                        "finding_type": "CONFLICT",
                        "dimension_name": dname,
                        "title": conf.get("title", f"Conflicting Information: {dname}")[:255],
                        "severity": conf.get("severity", "HIGH"),
                        "explanation": conf.get("explanation", ""),
                        "why_it_matters": conf.get("why_it_matters", "Conflicting claims create uncertainty and risk of non-compliance."),
                        "recommended_action": conf.get("recommended_action", "Check with the primary issuing agency for clarification."),
                        "claim_a_excerpt": conf.get("claim_a_excerpt"),
                        "claim_b_excerpt": conf.get("claim_b_excerpt"),
                        "confidence": 0.90 if is_genuine else 0.75,
                    })

    # Update dimension coverage status to CONFLICTING if a genuine conflict exists
    updated_dimensions = []
    for d in dimensions:
        d_copy = dict(d)
        if d["name"] in conflicted_dim_names:
            d_copy["coverage_status"] = "CONFLICTING"
            d_copy["explanation"] = "Contradictory or divergent claims detected across reviewed sources."
        updated_dimensions.append(d_copy)

    return updated_dimensions, conflict_findings
