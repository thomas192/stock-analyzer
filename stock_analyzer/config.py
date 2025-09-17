"""Runtime paths and configuration shared across the app.

Example:
    >>> from stock_analyzer.config import ANALYSIS_DIR
    >>> ANALYSIS_DIR.name
    'analysis'
"""
from __future__ import annotations

import os
from pathlib import Path

PACKAGE_DIR = Path(__file__).resolve().parent
BASE_DIR = PACKAGE_DIR.parent
FRONTEND_DIR = PACKAGE_DIR / "frontend"

ANALYSIS_DIR = BASE_DIR / "analysis"
DCF_DIR = BASE_DIR / "dcf"
DATA_DIR = BASE_DIR / "data"
SUMMARIES_DIR = BASE_DIR / "summaries"
TRANSCRIPTS_DIR = BASE_DIR / "transcripts"
TEMPLATE_DIR = FRONTEND_DIR / "templates"
STATIC_DIR = FRONTEND_DIR / "static"

ANALYSIS_NOTEBOOK = BASE_DIR / "analyze_stock.ipynb"
DCF_NOTEBOOK = BASE_DIR / "dcf.ipynb"
TRANSCRIPTS_NOTEBOOK = BASE_DIR / "transcripts.ipynb"
TRANSCRIPT_SUMMARY_NOTEBOOK = BASE_DIR / "transcript_summary.ipynb"


def get_secret_key() -> str:
    """Return a Flask secret key, favoring environment configuration."""
    return os.getenv("FLASK_SECRET_KEY", "secret_key")
