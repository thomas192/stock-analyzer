"""Helpers for executing Papermill notebooks that drive the app.

Example:
    >>> from stock_analyzer.notebooks import run_analysis
    >>> run_analysis("AAPL") in {True, False}
    True
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Mapping

import papermill as pm

from .config import (
    ANALYSIS_NOTEBOOK,
    DCF_NOTEBOOK,
    TRANSCRIPT_SUMMARY_NOTEBOOK,
    TRANSCRIPTS_NOTEBOOK,
)


def _execute_notebook(notebook_path: Path, parameters: Mapping[str, Any]) -> bool:
    try:
        pm.execute_notebook(str(notebook_path), None, parameters=dict(parameters))
        return True
    except Exception as exc:
        print(f"Error running {notebook_path.name}: {exc}")
        return False


def run_analysis(ticker: str) -> bool:
    """Run the core analysis notebook for 	icker."""
    return _execute_notebook(ANALYSIS_NOTEBOOK, {"ticker": ticker})


def run_dcf(
    ticker: str,
    fcf_ps: float,
    growth_rate: float,
    terminal_multiple: float,
    years: int,
    cash: float,
    debt: float,
    shares: float,
) -> bool:
    """Run the DCF notebook with the supplied valuation inputs."""
    params: dict[str, Any] = {
        "ticker": ticker,
        "fcf_ps": fcf_ps,
        "growth_rate": growth_rate,
        "terminal_multiple": terminal_multiple,
        "years": years,
        "cash": cash,
        "debt": debt,
        "shares": shares,
    }
    return _execute_notebook(DCF_NOTEBOOK, params)


def run_transcripts(ticker: str) -> bool:
    """Run the transcripts notebook to cache transcript data for 	icker."""
    return _execute_notebook(TRANSCRIPTS_NOTEBOOK, {"ticker_list": [ticker]})


def run_transcript_summary(ticker: str, year: int, quarter: int) -> bool:
    """Run the transcript summariser notebook for a specific quarter."""
    params = {"ticker": ticker, "year": year, "quarter": quarter}
    return _execute_notebook(TRANSCRIPT_SUMMARY_NOTEBOOK, params)
