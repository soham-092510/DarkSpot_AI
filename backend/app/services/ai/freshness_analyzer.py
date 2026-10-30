import re
from datetime import datetime, timezone
from typing import List, Dict, Any


def analyze_temporal_freshness(
    sources: List[Dict[str, Any]],
    current_year: int = 2026
) -> List[Dict[str, Any]]:
    """
    Evaluates temporal freshness and flags outdated or undated sources.
    Context-aware: Flags prior-cycle notices (e.g. <= 2024 for 2026 research).
    """
    freshness_findings = []

    for s in sources:
        title = s.get("title", "Untitled Source")
        pub_date = s.get("publication_date")
        s_text = s.get("clean_text", "")
        s_id = s.get("id")

        # 1. Undated source detection
        if not pub_date:
            freshness_findings.append({
                "finding_type": "OUTDATED",
                "title": f"Undated Source: {title[:80]}",
                "severity": "LOW",
                "explanation": f"Source '{title}' does not declare a formal publication or last-modified date. Timeliness cannot be confirmed.",
                "why_it_matters": "Policies, deadlines, and requirements change frequently; undated information may reflect superseded rules.",
                "recommended_action": "Cross-reference key specifications with an officially dated gazette or live portal notice.",
                "source_a_id": s_id,
                "confidence": 0.80,
            })
            continue

        # 2. Extract year from publication date
        year_match = re.search(r"\b(20\d\d)\b", str(pub_date))
        if year_match:
            pub_year = int(year_match.group(1))
            age_years = current_year - pub_year

            if age_years >= 2:
                freshness_findings.append({
                    "finding_type": "OUTDATED",
                    "title": f"Potentially Outdated Cycle: {title[:80]} ({pub_year})",
                    "severity": "HIGH",
                    "explanation": f"Source was published in {pub_year} ({age_years} years before the active {current_year} cycle).",
                    "why_it_matters": "Eligibility thresholds, deadlines, and required documentation are frequently revised across application cycles.",
                    "recommended_action": f"Do not rely on {pub_year} criteria for the {current_year} cycle. Verify active requirements on the live portal.",
                    "source_a_id": s_id,
                    "confidence": 0.95,
                })

    return freshness_findings
