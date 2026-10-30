import os
import sys
import time
import signal
import subprocess
import urllib.request

def run():
    print("=" * 60)
    print(" DarkSpot AI Production Suite — Starting Up")
    print("=" * 60)

    # Ensure PYTHONPATH includes project root
    root_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, root_dir)
    os.environ["PYTHONPATH"] = root_dir

    # 1. Initialize SQLite / Postgres Database Schema
    try:
        from backend.app.core.database import init_db
        init_db()
        print("[INIT] Database schema initialized successfully.")
    except Exception as e:
        print(f"[INIT] Database initialization notice: {e}")

    # 2. Launch FastAPI Backend Service on localhost:8001
    print("[BACKEND] Launching FastAPI backend on 127.0.0.1:8001...")
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = root_dir
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8001"],
        cwd=root_dir,
        env=backend_env
    )

    # 3. Launch Asynchronous Analysis Worker
    print("[WORKER] Launching Background Analysis Worker...")
    worker_proc = subprocess.Popen(
        [sys.executable, "-m", "backend.app.workers.analysis_worker"],
        cwd=root_dir,
        env=backend_env
    )

    # 4. Wait for Backend Service Health Check
    print("[HEALTH] Awaiting backend readiness on http://127.0.0.1:8001/health...")
    for attempt in range(1, 31):
        try:
            with urllib.request.urlopen("http://127.0.0.1:8001/health", timeout=2) as resp:
                if resp.status == 200:
                    print(f"[HEALTH] Backend is live and healthy after {attempt}s.")
                    break
        except Exception:
            time.sleep(1)
    else:
        print("[HEALTH] Warning: Health check timed out, proceeding to start frontend.")

    # 5. Launch Next.js Frontend on Render-assigned $PORT
    port = os.environ.get("PORT", "10000")
    print(f"[FRONTEND] Launching Next.js frontend on 0.0.0.0:{port}...")
    frontend_dir = os.path.join(root_dir, "frontend")

    frontend_env = os.environ.copy()
    frontend_env["PORT"] = port
    frontend_env["INTERNAL_BACKEND_URL"] = "http://127.0.0.1:8001"

    frontend_proc = subprocess.Popen(
        ["npx", "next", "start", "-H", "0.0.0.0", "-p", str(port)],
        cwd=frontend_dir,
        env=frontend_env
    )

    # Graceful Shutdown Handler
    def shutdown(signum, frame):
        print("\n[SHUTDOWN] Termination signal received. Stopping all processes...")
        for proc in [frontend_proc, worker_proc, backend_proc]:
            try:
                proc.terminate()
            except Exception:
                pass
        sys.exit(0)

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)

    # Wait for frontend process
    exit_code = frontend_proc.wait()
    for proc in [worker_proc, backend_proc]:
        try:
            proc.terminate()
        except Exception:
            pass
    sys.exit(exit_code)

if __name__ == "__main__":
    run()
