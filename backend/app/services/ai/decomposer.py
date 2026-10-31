import logging
from typing import Dict, Any, List, Optional
from backend.app.services.ai.gemini_client import GeminiClient

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are DarkSpot AI's Research Decomposition Engine.
Your task is to analyze a research question or topic and break it down into 5 to 7 essential research dimensions (information categories) that an investigator MUST verify to make a sound decision.
Also provide 3 to 4 targeted search queries to discover relevant evidence.

Return a JSON object conforming strictly to this structure:
{
  "dimensions": [
    {
      "name": "Dimension Title",
      "category": "High-level Category (e.g. Eligibility, Financial, Timeline, Process, Governance)",
      "importance_weight": 2.5,  // float between 1.0 (nice to have) and 3.0 (critical deal-breaker)
      "description": "Specific criteria that must be verified in this dimension"
    }
  ],
  "search_queries": [
    "targeted search query 1",
    "targeted search query 2"
  ]
}
"""


def decompose_question(topic_question: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Decomposes a research question into core dimensions and search queries.
    Uses Gemini when configured; falls back to domain-aware heuristic decomposition.
    """
    client = GeminiClient(api_key=api_key)
    if client.is_configured:
        prompt = f"Research Topic / Question to decompose: \"{topic_question}\""
        result = client.generate_json(SYSTEM_PROMPT, prompt)
        if result and "dimensions" in result and len(result["dimensions"]) >= 3:
            return result

    # Domain-aware heuristic fallback
    q_lower = topic_question.lower()

    if any(k in q_lower for k in ["scholarship", "fellowship", "grant", "stipend"]):
        return {
            "dimensions": [
                {
                    "name": "Eligibility & Academic Criteria",
                    "category": "Qualifications",
                    "importance_weight": 3.0,
                    "description": "Educational prerequisites, minimum percentage or CGPA, degree enrollment status."
                },
                {
                    "name": "Financial & Income Thresholds",
                    "category": "Eligibility",
                    "importance_weight": 3.0,
                    "description": "Family income ceiling, mandatory certificates, and tax return rules."
                },
                {
                    "name": "Required Documentation",
                    "category": "Submission",
                    "importance_weight": 2.0,
                    "description": "Mandatory certificates, affidavits, marksheets, and institution endorsements."
                },
                {
                    "name": "Application Deadlines & Timeline",
                    "category": "Timeline",
                    "importance_weight": 2.5,
                    "description": "Student submission cutoff, verification window, and disbursement dates."
                },
                {
                    "name": "Multi-Year Renewal Conditions",
                    "category": "Retention",
                    "importance_weight": 2.0,
                    "description": "Academic standing required to sustain aid in subsequent academic years."
                },
                {
                    "name": "Disbursement Amount & Coverage",
                    "category": "Financial",
                    "importance_weight": 2.0,
                    "description": "Tuition coverage, living allowance, and direct bank transfer mechanisms."
                }
            ],
            "search_queries": [
                f"{topic_question} official guidelines eligibility",
                f"{topic_question} required documents deadline",
                f"{topic_question} renewal conditions policy"
            ]
        }

    elif any(k in q_lower for k in ["job", "career", "hiring", "interview", "position"]):
        return {
            "dimensions": [
                {
                    "name": "Role Requirements & Qualifications",
                    "category": "Qualifications",
                    "importance_weight": 3.0,
                    "description": "Years of experience, technical skills, degree requirements."
                },
                {
                    "name": "Compensation & Benefits Range",
                    "category": "Compensation",
                    "importance_weight": 2.5,
                    "description": "Base salary, bonuses, equity, and health benefits."
                },
                {
                    "name": "Work Location & Flexibility",
                    "category": "Logistics",
                    "importance_weight": 2.0,
                    "description": "Remote, hybrid, or on-site expectations, travel requirements."
                },
                {
                    "name": "Selection Process & Evaluation",
                    "category": "Hiring",
                    "importance_weight": 2.0,
                    "description": "Assessment rounds, interviews, background checks."
                },
                {
                    "name": "Application Window & Start Date",
                    "category": "Timeline",
                    "importance_weight": 2.0,
                    "description": "Submission deadline and expected joining timeframe."
                }
            ],
            "search_queries": [
                f"{topic_question} requirements salary",
                f"{topic_question} hiring process timeline"
            ]
        }

    elif any(k in q_lower for k in ["jee", "exam", "admission", "entrance", "neet", "gate", "cutoff", "iit", "nit", "eligibility"]):
        return {
            "dimensions": [
                {
                    "name": "75% Board Aggregate & Top 20 Percentile Rule",
                    "category": "Academic Eligibility",
                    "importance_weight": 3.0,
                    "description": "Requirement of 75% marks in Class 12 (65% for SC/ST/PwD) or standing in top 20 percentile of qualifying board."
                },
                {
                    "name": "Maximum Allowable Attempts (Main vs Advanced)",
                    "category": "Attempt Limits",
                    "importance_weight": 3.0,
                    "description": "Limit of 3 consecutive attempts for JEE Main vs maximum 2 consecutive attempts for JEE Advanced."
                },
                {
                    "name": "Age Limit & Date of Birth Threshold",
                    "category": "Demographics",
                    "importance_weight": 2.5,
                    "description": "No age limit for JEE Main; specific date of birth cutoff threshold for JEE Advanced candidates."
                },
                {
                    "name": "Compulsory Subject Combinations",
                    "category": "Curriculum",
                    "importance_weight": 2.5,
                    "description": "Mandatory Physics and Mathematics with Chemistry, Biotechnology, Biology or Technical Vocational subject."
                },
                {
                    "name": "State Code of Eligibility & Home State Quota",
                    "category": "Quotas & Domicile",
                    "importance_weight": 2.0,
                    "description": "Determination of 50% Home State quota in NITs based on Class 12 examination center state."
                },
                {
                    "name": "Category Reservation & Certificate Cutoff Dates",
                    "category": "Reservation",
                    "importance_weight": 2.0,
                    "description": "Rules and mandatory issue dates for OBC-NCL, Gen-EWS, SC, ST, and PwD reservation certificates."
                }
            ],
            "search_queries": [
                f"{topic_question} 75 percent rule top 20 percentile",
                f"{topic_question} number of attempts age limit",
                f"{topic_question} nta information bulletin official"
            ]
        }

    # General / Default Research Topic
    return {
        "dimensions": [
            {
                "name": "Core Principles & Scope",
                "category": "Overview",
                "importance_weight": 3.0,
                "description": "Fundamental definitions, stated objectives, and baseline rules."
            },
            {
                "name": "Prerequisites & Requirements",
                "category": "Eligibility",
                "importance_weight": 2.5,
                "description": "Mandatory conditions, technical or legal specifications."
            },
            {
                "name": "Timeline & Effective Dates",
                "category": "Timeline",
                "importance_weight": 2.5,
                "description": "Milestones, deadlines, expiration, or active implementation cycle."
            },
            {
                "name": "Costs, Funding & Financial Terms",
                "category": "Financial",
                "importance_weight": 2.0,
                "description": "Budget constraints, fee structures, financial obligations."
            },
            {
                "name": "Governance & Verification Authority",
                "category": "Compliance",
                "importance_weight": 2.0,
                "description": "Supervising body, dispute mechanisms, and official verification sources."
            }
        ],
        "search_queries": [
            f"{topic_question} official guide details",
            f"{topic_question} requirements timeline"
        ]
    }
