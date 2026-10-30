import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import init_db

# Initialize database tables for testing
init_db()

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["app"] == "DarkSpot AI"


def test_ready():
    res = client.get("/ready")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"


def test_demo_endpoint():
    res = client.get("/api/demo")
    assert res.status_code == 200
    data = res.json()
    assert "ABC" in data["title"] and "Scholarship" in data["title"]
    assert data["is_sample_demo"] is True
    assert data["status"] == "completed"


def test_demo_project_artifacts():
    # Verify demo project's dimensions
    res = client.get("/api/projects/00000000-0000-0000-0000-000000000099/dimensions")
    assert res.status_code == 200
    dims = res.json()
    assert len(dims) >= 4
    statuses = [d["coverage_status"] for d in dims]
    assert "SUPPORTED" in statuses
    assert "CONFLICTING" in statuses
    assert "NOT_FOUND" in statuses

    # Verify demo project's findings
    res = client.get("/api/projects/00000000-0000-0000-0000-000000000099/findings")
    assert res.status_code == 200
    findings = res.json()
    assert len(findings) >= 3
    types = [f["finding_type"] for f in findings]
    assert "CONFLICT" in types
    assert "GAP" in types
    assert "OUTDATED" in types

    # Verify demo project's checklist
    res = client.get("/api/projects/00000000-0000-0000-0000-000000000099/checklist")
    assert res.status_code == 200
    tasks = res.json()
    assert len(tasks) >= 3
    assert any(t["priority"] == "CRITICAL" for t in tasks)
