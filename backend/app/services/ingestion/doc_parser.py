import io
import hashlib
from typing import Dict, Any, Optional
import fitz  # PyMuPDF
from docx import Document


def parse_document(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Parses PDF, DOCX, or TXT document bytes into structured clean text.
    """
    filename_lower = filename.lower()
    clean_text = ""
    error = None

    try:
        if filename_lower.endswith(".pdf"):
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            pages_text = []
            for page in doc:
                text = page.get_text()
                if text:
                    pages_text.append(text)
            clean_text = "\n".join(pages_text)
            doc.close()

        elif filename_lower.endswith(".docx"):
            file_stream = io.BytesIO(file_bytes)
            doc = Document(file_stream)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            clean_text = "\n".join(paragraphs)

        elif filename_lower.endswith(".txt"):
            try:
                clean_text = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                clean_text = file_bytes.decode("latin-1", errors="ignore")
        else:
            return {
                "status": "failed",
                "error": f"Unsupported file extension for {filename}. Supported formats: .pdf, .docx, .txt",
                "clean_text": "",
                "title": filename,
                "content_hash": None,
            }

        # Truncate to maximum analysis size (approx 100k chars)
        clean_text = clean_text[:100000].strip()
        content_hash = hashlib.sha256(clean_text.encode("utf-8")).hexdigest() if clean_text else None

        if len(clean_text) < 20:
            return {
                "status": "failed",
                "error": "Document contains insufficient extractable text (it may be scanned or empty).",
                "clean_text": "",
                "title": filename,
                "content_hash": None,
            }

        return {
            "status": "extracted",
            "error": None,
            "clean_text": clean_text,
            "title": filename,
            "content_hash": content_hash,
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": f"Document extraction failed: {str(e)}",
            "clean_text": "",
            "title": filename,
            "content_hash": None,
        }
