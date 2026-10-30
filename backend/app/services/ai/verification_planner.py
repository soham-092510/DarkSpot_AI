from typing import List, Dict, Any


def generate_verification_checklist(
    findings: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Transforms findings (Gaps, Conflicts, Outdated warnings) into an actionable,
    prioritized verification checklist for the user.
    """
    tasks = []

    priority_map = {
        "CRITICAL": "CRITICAL",
        "HIGH": "HIGH",
        "MEDIUM": "MEDIUM",
        "LOW": "LOW",
    }

    for f in findings:
        f_type = f.get("finding_type", "GAP")
        severity = f.get("severity", "MEDIUM")
        priority = priority_map.get(severity, "MEDIUM")
        title = f.get("title", "Verify Information")

        if f_type == "CONFLICT":
            task_title = f"Resolve Discrepancy: {title.replace('Conflicting Information: ', '')}"
            action = f.get("recommended_action") or "Confirm with the official authority which requirement applies to your situation."
            rationale = f"Conflicting information exists in reviewed sources: {f.get('why_it_matters')}"
            rec_source = "Official Issuing Authority / Helpdesk"
        elif f_type == "GAP":
            task_title = f"Verify Unaddressed Detail: {f.get('dimension_name', title)}"
            action = f.get("recommended_action") or "Consult primary documentation to confirm missing criteria."
            rationale = f"Critical information was not found in reviewed sources: {f.get('why_it_matters')}"
            rec_source = "Primary Scheme Gazette / Central Portal"
        elif f_type == "OUTDATED":
            task_title = f"Verify Live Active Version: {title}"
            action = f.get("recommended_action") or "Ensure you are viewing the current year announcement."
            rationale = f"Source may reflect outdated rules: {f.get('why_it_matters')}"
            rec_source = "Official Live Website"
        else:
            task_title = f"Verify: {title}"
            action = f.get("recommended_action", "Verify details with authorized personnel.")
            rationale = f.get("why_it_matters", "Ensure accuracy prior to decision.")
            rec_source = "Authoritative Source"

        tasks.append({
            "title": task_title[:255],
            "action_required": action,
            "rationale": rationale,
            "recommended_source": rec_source,
            "priority": priority,
            "status": "PENDING",
            "finding_id": f.get("id"),
        })

    # Sort tasks: CRITICAL first, then HIGH, then MEDIUM, then LOW
    sort_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    tasks.sort(key=lambda t: sort_order.get(t["priority"], 99))

    return tasks
