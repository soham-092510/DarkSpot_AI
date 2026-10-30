"""
Official DarkSpot AI Sample Demonstration Dataset.
Topic: "ABC Scholarship 2026 — Verification & Eligibility Research"
NOTE: Clearly labeled as illustrative sample data for product demonstration.
"""

DEMO_PROJECT = {
    "title": "ABC National Merit Scholarship 2026",
    "topic_question": "What are the eligibility requirements, required documents, and deadline for the ABC Scholarship 2026, and what critical conditions must be verified before applying?",
    "depth": "deep",
    "coverage_score": 62.5,  # Calculated via weighted formula
}

DEMO_SOURCES = [
    {
        "title": "ABC Foundation Official Portal — Scholarship Guidelines",
        "url": "https://scholarships.gov.in/abc-merit-scheme-2026",
        "publisher_domain": "scholarships.gov.in",
        "publication_date": "2026-01-15",
        "source_type": "webpage",
        "status": "extracted",
        "clean_text": (
            "ABC National Merit Scholarship 2026. Official Notification. "
            "Eligibility Criteria: Applicants must be enrolled in an accredited undergraduate degree program. "
            "Minimum academic score: 75% aggregate in 12th standard board examinations. "
            "Annual family income must not exceed ₹2,00,000 (Rupees Two Lakhs) as certified by an authorized revenue official. "
            "Required Documents: 10th and 12th standard marksheets, Bonafide Student Certificate from College Dean, "
            "Income Certificate issued on or after April 1, 2025, and Aadhar-linked Bank Account details. "
            "Applications must be submitted through the National Scholarship Portal before the deadline. "
            "Note: Renewal guidelines for subsequent academic years will be notified separately by the steering committee."
        ),
    },
    {
        "title": "State Higher Education Directorate — Student Aid Circular",
        "url": "https://highered.state.gov/circulars/student-aid-criteria",
        "publisher_domain": "highered.state.gov",
        "publication_date": "2026-02-01",
        "source_type": "webpage",
        "status": "extracted",
        "clean_text": (
            "Circular on State and Central Scholarships 2026. "
            "For ABC Merit Scheme: Family income ceiling is set at ₹3,00,000 per annum for regional beneficiaries. "
            "Students must upload an affidavit alongside domicile certificate. "
            "Tentative closing date for application verification by institutions is October 31, 2026."
        ),
    },
    {
        "title": "National Student Welfare Forum — Previous Year Archive Notice",
        "url": "https://studentwelfare.org/archives/abc-scholarship-2024",
        "publisher_domain": "studentwelfare.org",
        "publication_date": "2024-08-10",
        "source_type": "webpage",
        "status": "extracted",
        "clean_text": (
            "ARCHIVE: ABC Scholarship 2024 Notification. "
            "Last date to apply was September 15, 2024. Renewal required maintaining a 6.5 CGPA in university semesters. "
            "Late submissions will not be entertained."
        ),
    },
]

DEMO_DIMENSIONS = [
    {
        "name": "Eligibility & Academic Criteria",
        "category": "Qualifications",
        "importance_weight": 2.5,
        "coverage_status": "SUPPORTED",
        "explanation": "Clear academic requirements found: Enrolled in accredited undergraduate degree with minimum 75% aggregate in 12th standard.",
        "order_index": 1,
    },
    {
        "name": "Income Limit & Financial Conditions",
        "category": "Eligibility",
        "importance_weight": 3.0,
        "coverage_status": "CONFLICTING",
        "explanation": "Direct contradiction between Central Official Portal (₹2,00,000 ceiling) and State Directorate Circular (₹3,00,000 ceiling).",
        "order_index": 2,
    },
    {
        "name": "Required Documentation",
        "category": "Submission",
        "importance_weight": 2.0,
        "coverage_status": "PARTIALLY_SUPPORTED",
        "explanation": "Official portal lists marksheets, bonafide certificate, and income proof; State circular introduces domicile affidavit not mentioned in portal.",
        "order_index": 3,
    },
    {
        "name": "Application Deadline (2026 Cycle)",
        "category": "Timeline",
        "importance_weight": 2.5,
        "coverage_status": "NEEDS_VERIFICATION",
        "explanation": "Official 2026 notification does not explicitly specify final student submission cutoff. State circular gives tentative institutional verification date only.",
        "order_index": 4,
    },
    {
        "name": "Renewal Conditions & Minimum CGPA",
        "category": "Retention",
        "importance_weight": 2.0,
        "coverage_status": "NOT_FOUND",
        "explanation": "The 2026 official sources explicitly state renewal guidelines will be notified separately. No confirmed 2026 renewal terms exist in reviewed sources.",
        "order_index": 5,
    },
]

DEMO_CLAIMS = [
    {
        "dimension_name": "Eligibility & Academic Criteria",
        "source_index": 0,
        "subject": "Applicant Academic Eligibility",
        "predicate": "requires minimum aggregate score",
        "value": "75% in 12th standard board examinations",
        "conditions": "Enrolled in accredited undergraduate degree program",
        "applicable_date_cycle": "2026 Cycle",
        "exact_excerpt": "Minimum academic score: 75% aggregate in 12th standard board examinations.",
        "confidence": 1.0,
    },
    {
        "dimension_name": "Income Limit & Financial Conditions",
        "source_index": 0,
        "subject": "Annual Family Income Ceiling",
        "predicate": "must not exceed",
        "value": "₹2,00,000 (Two Lakhs) per annum",
        "conditions": "Certified by authorized revenue official",
        "applicable_date_cycle": "2026 Cycle",
        "exact_excerpt": "Annual family income must not exceed ₹2,00,000 (Rupees Two Lakhs) as certified by an authorized revenue official.",
        "confidence": 1.0,
    },
    {
        "dimension_name": "Income Limit & Financial Conditions",
        "source_index": 1,
        "subject": "Annual Family Income Ceiling",
        "predicate": "is set at",
        "value": "₹3,00,000 per annum",
        "conditions": "For regional state beneficiaries",
        "applicable_date_cycle": "2026 Cycle",
        "exact_excerpt": "For ABC Merit Scheme: Family income ceiling is set at ₹3,00,000 per annum for regional beneficiaries.",
        "confidence": 0.95,
    },
    {
        "dimension_name": "Required Documentation",
        "source_index": 0,
        "subject": "Required Application Documents",
        "predicate": "includes mandatory",
        "value": "10th/12th marksheets, Bonafide certificate, Income certificate, Aadhar bank details",
        "conditions": "Income certificate issued on or after April 1, 2025",
        "applicable_date_cycle": "2026 Cycle",
        "exact_excerpt": "Required Documents: 10th and 12th standard marksheets, Bonafide Student Certificate from College Dean, Income Certificate issued on or after April 1, 2025",
        "confidence": 1.0,
    },
    {
        "dimension_name": "Application Deadline (2026 Cycle)",
        "source_index": 2,
        "subject": "Application Deadline",
        "predicate": "was scheduled on",
        "value": "September 15, 2024 (EXPIRED)",
        "conditions": "Archive publication for 2024 academic cycle",
        "applicable_date_cycle": "2024 Cycle (Outdated)",
        "exact_excerpt": "ARCHIVE: ABC Scholarship 2024 Notification. Last date to apply was September 15, 2024.",
        "confidence": 1.0,
    },
]

DEMO_FINDINGS = [
    {
        "finding_type": "CONFLICT",
        "dimension_name": "Income Limit & Financial Conditions",
        "title": "Discrepancy in Family Income Ceiling (₹2,00,000 vs ₹3,00,000)",
        "severity": "CRITICAL",
        "explanation": "Source A (Official National Portal) specifies a strict ₹2,00,000 limit, whereas Source B (State Higher Ed Directorate) indicates a ₹3,00,000 threshold for regional students. Submitting with >₹2L income risks automatic rejection if National Portal rules prevail.",
        "why_it_matters": "Applying under the wrong income threshold will lead to immediate disqualification or legal compliance rejection.",
        "recommended_action": "Check the official central scholarship desk to determine whether state quota relaxation applies to your institute.",
        "source_a_index": 0,
        "source_b_index": 1,
        "claim_a_excerpt": "Annual family income must not exceed ₹2,00,000 (Rupees Two Lakhs) as certified by an authorized revenue official.",
        "claim_b_excerpt": "For ABC Merit Scheme: Family income ceiling is set at ₹3,00,000 per annum for regional beneficiaries.",
        "confidence": 0.95,
    },
    {
        "finding_type": "GAP",
        "dimension_name": "Renewal Conditions & Minimum CGPA",
        "title": "Multi-Year Renewal Conditions Completely Missing for 2026",
        "severity": "HIGH",
        "explanation": "Reviewed 2026 official sources explicitly defer renewal criteria to a future notice. It is unknown whether beneficiaries must maintain a 6.0, 7.0, or higher CGPA to continue receiving disbursements in Year 2 and Year 3.",
        "why_it_matters": "Students budgeting on continuous degree funding could lose financial support after Year 1 if renewal criteria are unexpectedly stringent.",
        "recommended_action": "Email the ABC Foundation scholarship officer or review the governing scheme gazette for renewal terms.",
        "source_a_index": 0,
        "confidence": 1.0,
    },
    {
        "finding_type": "OUTDATED",
        "dimension_name": "Application Deadline (2026 Cycle)",
        "title": "Potentially Outdated Application Cycle (2024 Notice Used)",
        "severity": "HIGH",
        "explanation": "Source C cites a deadline of 'September 15', but this notice was published in August 2024 for the 2024 cycle. Relying on this date for the 2026 cycle is invalid.",
        "why_it_matters": "Students may miss the actual 2026 window or rush unnecessarily based on an expired cycle notice.",
        "recommended_action": "Disregard 2024 archival dates and look strictly for the live 2026 announcement on the official portal.",
        "source_a_index": 2,
        "confidence": 1.0,
    },
    {
        "finding_type": "UNANSWERED_QUESTION",
        "dimension_name": "Required Documentation",
        "title": "Mandatory Domicile Affidavit Not Clarified in Central Portal",
        "severity": "MEDIUM",
        "explanation": "The State Directorate mentions a domicile affidavit requirement, but the Central Portal does not specify format, notarization level, or issuing authority.",
        "why_it_matters": "Procuring notarized state affidavits typically takes 1-2 weeks. Without knowing the required format, submissions may be rejected for non-compliance.",
        "recommended_action": "Verify with the college scholarship liaison whether state-specific domicile affidavits must be physically stamped.",
        "source_a_index": 1,
        "confidence": 0.85,
    },
]

DEMO_TASKS = [
    {
        "title": "Confirm 2026 Official Application Closing Date",
        "action_required": "Inspect the live National Scholarship Portal (NSP) ticker for the official 2026 deadline cutoff for undergraduate applicants.",
        "rationale": "Archival sources present expired 2024 deadlines; current 2026 circular has not specified the student portal closing date.",
        "recommended_source": "https://scholarships.gov.in/ (Official Notice Board)",
        "priority": "CRITICAL",
        "status": "PENDING",
    },
    {
        "title": "Clarify Eligible Income Limit with Institute Nodal Officer",
        "action_required": "Inquire whether your institution follows the ₹2,00,000 Central ceiling or the ₹3,00,000 State Directorate threshold.",
        "rationale": "Sources show a ₹1,00,000 discrepancy between central and state guidelines.",
        "recommended_source": "College Dean / Institute Scholarship Desk",
        "priority": "CRITICAL",
        "status": "PENDING",
    },
    {
        "title": "Verify Income Certificate Issue Date Validity",
        "action_required": "Ensure your revenue official income certificate is dated on or after April 1, 2025 as mandated by official rules.",
        "rationale": "Certificates issued prior to April 1, 2025 are explicitly non-compliant and cause rejection.",
        "recommended_source": "Tehsildar / Revenue Authority Portal",
        "priority": "HIGH",
        "status": "IN_PROGRESS",
    },
    {
        "title": "Request Written 2026 Renewal Policy Guidelines",
        "action_required": "Contact the ABC Foundation helpdesk to obtain the CGPA maintenance benchmark for Year 2 and Year 3 stipend continuity.",
        "rationale": "Renewal policy is currently unannounced in 2026 public documents.",
        "recommended_source": "ABC Foundation Support Helpdesk",
        "priority": "MEDIUM",
        "status": "PENDING",
    },
]
