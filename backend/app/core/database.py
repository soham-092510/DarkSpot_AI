from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

# Normalize postgres:// to postgresql:// for SQLAlchemy 2.0 compatibility (e.g. Render / Supabase)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Determine if we're using SQLite
is_sqlite = db_url.startswith("sqlite")

connect_args = {}
if is_sqlite:
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    # For SQLite, avoid connection pooling issues
    **({} if is_sqlite else {"pool_size": 10, "max_overflow": 20})
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes tables and handles schema migrations for SQLite."""
    Base.metadata.create_all(bind=engine)

    # Auto-migration for SQLite dev instances to ensure newly added columns exist
    if is_sqlite:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if "users" in inspector.get_table_names():
                existing_cols = {c["name"] for c in inspector.get_columns("users")}
                new_cols = [
                    ("is_verified", "BOOLEAN DEFAULT 0"),
                    ("verification_token", "VARCHAR(255)"),
                    ("verification_token_expires_at", "DATETIME"),
                    ("reset_token", "VARCHAR(255)"),
                    ("reset_token_expires_at", "DATETIME"),
                ]
                for col_name, col_type in new_cols:
                    if col_name not in existing_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                            conn.commit()
                        except Exception:
                            pass
