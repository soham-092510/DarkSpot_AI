import time
from collections import defaultdict
from typing import Dict, List, Optional
from fastapi import Request, HTTPException, status


class SlidingWindowRateLimiter:
    """
    In-memory sliding-window rate limiter for production endpoint protection.
    Tracks timestamps per key and automatically purges windows older than window_seconds.
    """

    def __init__(self, max_requests: int, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds

        # Filter out expired timestamps
        timestamps = [t for t in self.requests[key] if t > cutoff]
        self.requests[key] = timestamps

        if len(timestamps) >= self.max_requests:
            return False

        self.requests[key].append(now)
        return True

    def retry_after(self, key: str) -> int:
        now = time.time()
        cutoff = now - self.window_seconds
        timestamps = [t for t in self.requests[key] if t > cutoff]
        if not timestamps:
            return 1
        oldest = min(timestamps)
        return max(1, int(self.window_seconds - (now - oldest)))


# Rate limiters for critical endpoints
auth_login_limiter = SlidingWindowRateLimiter(max_requests=5, window_seconds=60)
auth_register_limiter = SlidingWindowRateLimiter(max_requests=5, window_seconds=60)
password_reset_limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60)
credential_test_limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=60)
project_create_limiter = SlidingWindowRateLimiter(max_requests=15, window_seconds=60)


def get_client_ip(request: Request) -> str:
    """Safely extracts client IP address with proxy support."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Take the leftmost public IP
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def enforce_rate_limit(limiter: SlidingWindowRateLimiter, key: str, action: str = "request"):
    """Raises HTTPException 429 if rate limit is exceeded."""
    if not limiter.is_allowed(key):
        retry_seconds = limiter.retry_after(key)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many {action} attempts. Please wait {retry_seconds} seconds before retrying.",
            headers={"Retry-After": str(retry_seconds)}
        )
