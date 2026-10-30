import pytest
from backend.app.services.ai.gap_detector import calculate_evidence_coverage


def test_coverage_all_supported():
    dims = [
        {"importance_weight": 2.0, "coverage_status": "SUPPORTED"},
        {"importance_weight": 3.0, "coverage_status": "SUPPORTED"},
    ]
    score = calculate_evidence_coverage(dims)
    assert score == 100.0


def test_coverage_all_not_found():
    dims = [
        {"importance_weight": 2.0, "coverage_status": "NOT_FOUND"},
        {"importance_weight": 3.0, "coverage_status": "NOT_FOUND"},
    ]
    score = calculate_evidence_coverage(dims)
    assert score == 0.0


def test_coverage_weighted_mixture():
    # Dim 1: weight 2.0, SUPPORTED (score 1.0) -> 2.0
    # Dim 2: weight 2.0, PARTIALLY_SUPPORTED (score 0.5) -> 1.0
    # Dim 3: weight 2.0, NOT_FOUND (score 0.0) -> 0.0
    # Total weight = 6.0, weighted sum = 3.0 -> 50%
    dims = [
        {"importance_weight": 2.0, "coverage_status": "SUPPORTED"},
        {"importance_weight": 2.0, "coverage_status": "PARTIALLY_SUPPORTED"},
        {"importance_weight": 2.0, "coverage_status": "NOT_FOUND"},
    ]
    score = calculate_evidence_coverage(dims)
    assert score == 50.0


def test_coverage_empty_dimensions():
    score = calculate_evidence_coverage([])
    assert score == 0.0
