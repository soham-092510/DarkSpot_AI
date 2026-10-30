import logging
from typing import List, Dict, Any, Tuple, Optional
from backend.app.services.ai.gemini_client import GeminiClient

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are DarkSpot AI's Information Gap & Blind-Spot Engine.
Your task is to identify information gaps and formulate critical unanswered questions for dimensions that lack sufficient evidence.

IMPORTANT: Clearly emphasize that 'Not found in reviewed sources does not prove non-existence.'
For each gap, explain WHY this missing detail is critical for the user's decision.

Return a JSON object conforming strictly to this format:
{
  "gaps": [
    {
      "dimension_name": "Target Dimension Name",
      "title": "Clear gap title (e.g. Renewal Conditions Not Found)",
      "severity": "CRITICAL", // CRITICAL, HIGH, MEDIUM, LOW
      "explanation": "What specific information is absent from the reviewed sources",
      "why_it_matters": "The real-world consequence of making a decision without this information",
      "unanswered_questions": [
        "Unanswered question 1",
        "Unanswered question 2"
      ],
      "recommended_action": "Where or how the user should verify this missing information"
    }
  ]
}
"""


def calculate_evidence_coverage(dimensions_with_status: List[Dict[str, Any]]) -> float:
    """
    Computes the deterministic Evidence Coverage Score using the formula:
    Coverage = (sum(w_i * s_i) / sum(w_i)) * 100
    Where status scores:
      SUPPORTED = 1.0
      PARTIALLY_SUPPORTED = 0.5
      CONFLICTING = 0.25
      NOT_FOUND = 0.0
      NEEDS_VERIFICATION = 0.25
    """
    if not dimensions_with_status:
        return 0.0

    status_weights = {
        "SUPPORTED": 1.0,
        "PARTIALLY_SUPPORTED": 0.5,
        "CONFLICTING": 0.25,
        "NEEDS_VERIFICATION": 0.25,
        "NOT_FOUND": 0.0,
    }

    total_weight = 0.0
    weighted_score = 0.0

    for d in dimensions_with_status:
        weight = float(d.get("importance_weight", 1.0))
        status = d.get("coverage_status", "NOT_FOUND").upper()
        score = status_weights.get(status, 0.0)

        total_weight += weight
        weighted_score += (weight * score)

    if total_weight <= 0:
        return 0.0

    return round((weighted_score / total_weight) * 100, 1)


def detect_gaps_and_blindspots(
    topic_question: str,
    dimensions: List[Dict[str, Any]],
    claims: List[Dict[str, Any]],
    api_key: Optional[str] = None
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Evaluates evidence coverage for each dimension, assigns coverage status,
    and generates detailed Gap findings for unaddressed dimensions.
    Returns (updated_dimensions, gap_findings).
    """
    # Group claims by dimension name
    claims_by_dim: Dict[str, List[Dict[str, Any]]] = {}
    for c in claims:
        dname = c.get("dimension_name", "General")
        claims_by_dim.setdefault(dname, []).append(c)

    updated_dimensions = []
    gap_targets = []

    for dim in dimensions:
        dname = dim["name"]
        dim_claims = claims_by_dim.get(dname, [])
        weight = dim.get("importance_weight", 1.0)

        # Determine coverage status based on claim count and confidence
        if len(dim_claims) >= 2:
            status = "SUPPORTED"
            explanation = f"Supported by {len(dim_claims)} factual claims across reviewed sources."
        elif len(dim_claims) == 1:
            status = "PARTIALLY_SUPPORTED"
            explanation = "Partially supported: only a single claim was identified in reviewed sources."
            gap_targets.append(dim)
        else:
            status = "NOT_FOUND"
            explanation = "Information was not identified in any of the reviewed sources."
            gap_targets.append(dim)

        dim_copy = dict(dim)
        dim_copy["coverage_status"] = status
        dim_copy["explanation"] = explanation
        dim_copy["claims_count"] = len(dim_claims)
        updated_dimensions.append(dim_copy)

    # Generate gap findings
    gap_findings = []
    client = GeminiClient(api_key=api_key)

    if gap_targets and client.is_configured:
        targets_str = "\n".join([f"- {d['name']} ({d.get('category')}): {d.get('description', '')}" for d in gap_targets])
        user_prompt = (
            f"Research Question: {topic_question}\n\n"
            f"The following dimensions were NOT FOUND or only PARTIALLY supported in the reviewed sources:\n"
            f"{targets_str}\n\n"
            f"Generate structured gap findings explaining why each missing area matters."
        )
        ai_res = client.generate_json(SYSTEM_PROMPT, user_prompt)
        if ai_res and "gaps" in ai_res and isinstance(ai_res["gaps"], list):
            for g in ai_res["gaps"]:
                gap_findings.append({
                    "finding_type": "GAP",
                    "dimension_name": g.get("dimension_name", gap_targets[0]["name"]),
                    "title": g.get("title", f"Information Missing: {g.get('dimension_name')}")[:255],
                    "severity": g.get("severity", "HIGH"),
                    "explanation": f"{g.get('explanation', '')} (Note: Information was not found in reviewed sources; this does not prove non-existence.)",
                    "why_it_matters": g.get("why_it_matters", "Making decisions without this critical data introduces operational or eligibility risk."),
                    "recommended_action": g.get("recommended_action", "Consult the primary authority notice or designated helpdesk."),
                    "confidence": 0.95,
                })
            return updated_dimensions, gap_findings

    # Deterministic fallback gap findings
    for d in gap_targets:
        severity = "CRITICAL" if d.get("importance_weight", 1.0) >= 2.5 else "HIGH"
        gap_findings.append({
            "finding_type": "GAP",
            "dimension_name": d["name"],
            "title": f"Missing Details: {d['name']}",
            "severity": severity,
            "explanation": f"The reviewed sources did not provide concrete details regarding '{d['name']}'. (Information was not found in reviewed sources; this does not prove non-existence.)",
            "why_it_matters": f"Proceeding without verifying '{d['name']}' could lead to unexpected disqualification, missed deadlines, or incorrect assumptions.",
            "recommended_action": f"Verify '{d['name']}' directly through the issuing body's official gazette or representative.",
            "confidence": 0.90,
        })

    return updated_dimensions, gap_findings
