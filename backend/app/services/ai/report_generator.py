import json
from typing import Dict, Any, List


def generate_research_dossier_report(
    project: Dict[str, Any],
    sources: List[Dict[str, Any]],
    dimensions: List[Dict[str, Any]],
    claims: List[Dict[str, Any]],
    findings: List[Dict[str, Any]],
    tasks: List[Dict[str, Any]],
    coverage_score: float
) -> Dict[str, Any]:
    """
    Assembles a comprehensive, executive research dossier and report in structured JSON and Markdown.
    """
    title = f"Research Intelligence Dossier: {project.get('title', 'Untitled Project')}"

    gaps = [f for f in findings if f.get("finding_type") == "GAP"]
    conflicts = [f for f in findings if f.get("finding_type") == "CONFLICT"]
    outdated = [f for f in findings if f.get("finding_type") == "OUTDATED"]

    exec_summary = (
        f"DarkSpot AI evaluated '{project.get('topic_question')}' across {len(sources)} sources. "
        f"The calculated Evidence Coverage Score is {coverage_score}% across {len(dimensions)} core research dimensions. "
        f"The analysis identified {len(gaps)} potential information gaps, {len(conflicts)} conflicting claim pairs, "
        f"and {len(outdated)} temporal freshness warnings. "
        f"{len(tasks)} prioritized verification actions were formulated to guide pre-decision validation."
    )

    # Markdown dossier generation
    md_lines = [
        f"# {title}",
        f"\n**Topic / Inquiry:** {project.get('topic_question')}",
        f"**Evidence Coverage Score:** {coverage_score}% | **Analyzed Sources:** {len(sources)} | **Identified Gaps:** {len(gaps)} | **Conflicts:** {len(conflicts)}",
        "\n> [!NOTE]",
        "> **Important Evaluation Notice**: The Evidence Coverage Score reflects the degree of coverage found within the reviewed sources, not absolute factual correctness. Not finding information in reviewed sources does not prove non-existence.",
        "\n---",
        "\n## 1. Executive Summary",
        f"\n{exec_summary}",
        "\n---",
        "\n## 2. Evidence Coverage Matrix",
        "\n| Dimension | Category | Weight | Coverage Status | Explanation |",
        "| :--- | :--- | :---: | :---: | :--- |"
    ]

    for d in dimensions:
        md_lines.append(
            f"| **{d.get('name')}** | {d.get('category', 'General')} | {d.get('importance_weight', 1.0)}x | `{d.get('coverage_status')}` | {d.get('explanation', '')} |"
        )

    if conflicts:
        md_lines.extend([
            "\n---",
            "\n## 3. Contradiction Intelligence",
            "\n| Dimension | Discrepancy Title | Severity | Source A vs Source B Claims | Resolution |",
            "| :--- | :--- | :---: | :--- | :--- |"
        ])
        for c in conflicts:
            claim_cmp = f"**A:** \"{c.get('claim_a_excerpt', 'N/A')}\"<br>**B:** \"{c.get('claim_b_excerpt', 'N/A')}\""
            md_lines.append(
                f"| {c.get('dimension_name')} | **{c.get('title')}** | `{c.get('severity')}` | {claim_cmp} | {c.get('recommended_action')} |"
            )

    if gaps:
        md_lines.extend([
            "\n---",
            "\n## 4. Information Gaps & Unanswered Questions",
            "\n| Dimension | Gap Detected | Severity | Why It Matters | Verification Target |",
            "| :--- | :--- | :---: | :--- | :--- |"
        ])
        for g in gaps:
            md_lines.append(
                f"| {g.get('dimension_name')} | **{g.get('title')}** | `{g.get('severity')}` | {g.get('why_it_matters')} | {g.get('recommended_action')} |"
            )

    if outdated:
        md_lines.extend([
            "\n---",
            "\n## 5. Temporal Intelligence & Freshness Warnings",
            "\n| Target | Warning | Severity | Rationale |",
            "| :--- | :--- | :---: | :--- |"
        ])
        for o in outdated:
            md_lines.append(
                f"| {o.get('title')} | {o.get('explanation')} | `{o.get('severity')}` | {o.get('recommended_action')} |"
            )

    md_lines.extend([
        "\n---",
        "\n## 6. Prioritized Verification Checklist",
        "\n| Priority | Action Required | Rationale | Recommended Authority |",
        "| :---: | :--- | :--- | :--- |"
    ])
    for t in tasks:
        md_lines.append(
            f"| `{t.get('priority')}` | **{t.get('title')}**<br>{t.get('action_required')} | {t.get('rationale')} | {t.get('recommended_source', 'Official Authority')} |"
        )

    md_lines.extend([
        "\n---",
        "\n## 7. Sources Reviewed",
        "\n| # | Title | Publisher Domain | Publication Date | URL |",
        "| :---: | :--- | :--- | :---: | :--- |"
    ])
    for i, s in enumerate(sources, 1):
        url = s.get("url") or "Uploaded Document"
        md_lines.append(
            f"| {i} | {s.get('title')} | {s.get('publisher_domain', 'Local')} | {s.get('publication_date', 'Undated')} | [{url}]({url}) |"
        )

    full_markdown = "\n".join(md_lines)

    coverage_summary = {
        "score": coverage_score,
        "total_dimensions": len(dimensions),
        "supported": sum(1 for d in dimensions if d.get("coverage_status") == "SUPPORTED"),
        "partially_supported": sum(1 for d in dimensions if d.get("coverage_status") == "PARTIALLY_SUPPORTED"),
        "not_found": sum(1 for d in dimensions if d.get("coverage_status") == "NOT_FOUND"),
        "conflicting": sum(1 for d in dimensions if d.get("coverage_status") == "CONFLICTING"),
        "gaps_count": len(gaps),
        "conflicts_count": len(conflicts),
        "outdated_count": len(outdated),
        "tasks_count": len(tasks),
    }

    return {
        "title": title,
        "executive_summary": exec_summary,
        "coverage_summary_json": json.dumps(coverage_summary),
        "full_markdown": full_markdown,
    }
