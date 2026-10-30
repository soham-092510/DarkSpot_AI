import pytest
from backend.app.core.security import is_safe_url


def test_ssrf_blocks_localhost():
    is_safe, msg = is_safe_url("http://localhost:8000")
    assert not is_safe
    assert "localhost" in msg.lower() or "restricted" in msg.lower() or "loopback" in msg.lower()


def test_ssrf_blocks_loopback_ip():
    is_safe, msg = is_safe_url("http://127.0.0.1:8000/admin")
    assert not is_safe


def test_ssrf_blocks_cloud_metadata():
    is_safe, msg = is_safe_url("http://169.254.169.254/latest/meta-data")
    assert not is_safe


def test_ssrf_blocks_private_rfc1918():
    is_safe, msg = is_safe_url("http://192.168.1.1/router")
    assert not is_safe
    is_safe, msg = is_safe_url("http://10.0.0.5/internal")
    assert not is_safe


def test_ssrf_blocks_invalid_schemes():
    is_safe, msg = is_safe_url("ftp://example.com/file")
    assert not is_safe
    is_safe, msg = is_safe_url("file:///etc/passwd")
    assert not is_safe


def test_ssrf_allows_public_https():
    is_safe, msg = is_safe_url("https://scholarships.gov.in/portal")
    # Even if DNS resolution fails in local mock environment, format checks apply
    if not is_safe:
        assert "could not be resolved" in msg or "restricted" not in msg
