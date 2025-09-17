"""HTTP routes serving the stock analysis workflow.

Example:
    >>> from flask import Flask
    >>> from stock_analyzer.web import register_routes
    >>> app = Flask(__name__)
    >>> register_routes(app)
"""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor

from flask import Blueprint, Flask, flash, redirect, render_template, request, url_for

from .data_access import (
    delete_cache_files,
    load_analysis_data,
    load_dcf_data,
    load_transcript_data,
    load_transcript_summary,
)
from .notebooks import (
    run_analysis,
    run_dcf,
    run_transcript_summary,
    run_transcripts,
)

bp = Blueprint("web", __name__)


def register_routes(app: Flask) -> None:
    """Attach the module's blueprint to `app`."""
    app.register_blueprint(bp)


def _normalize_ticker(raw: str) -> str:
    return (raw or "").upper().strip()


@bp.route("/compute_summary", methods=["POST"])
def compute_summary():
    ticker = _normalize_ticker(request.form.get("ticker", ""))
    try:
        year = int(request.form.get("year"))
        quarter = int(request.form.get("quarter"))
    except (TypeError, ValueError):
        return {"error": "Invalid year or quarter parameter."}, 400

    if not run_transcript_summary(ticker, year, quarter):
        return {"error": "Error generating summary."}, 500

    summary = load_transcript_summary(ticker, year, quarter)
    if not summary:
        return {"error": "Summary file not found."}, 500
    return summary


@bp.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        ticker = _normalize_ticker(request.form.get("ticker", ""))
        if not ticker:
            flash("Ticker symbol is required.")
            return redirect(url_for("web.index"))

        with ThreadPoolExecutor(max_workers=2) as executor:
            future_analysis = executor.submit(run_analysis, ticker)
            future_transcripts = executor.submit(run_transcripts, ticker)
            analysis_ok = future_analysis.result()
            transcripts_ok = future_transcripts.result()

        if not analysis_ok:
            flash("There was an error running the analysis.")
            return redirect(url_for("web.index"))

        metrics = load_analysis_data(ticker)
        if not metrics:
            flash("Analysis data not found. Please try again.")
            return redirect(url_for("web.index"))

        transcript_data = []
        if transcripts_ok:
            transcript_data = load_transcript_data(ticker)
        else:
            flash("There was an error running the transcripts analysis.")

        return render_template(
            "result.html",
            ticker=ticker,
            metrics=metrics,
            dcf_results=None,
            dcf_params=None,
            transcript_data=transcript_data,
        )

    return render_template("index.html")


@bp.route("/compute_dcf", methods=["POST"])
def compute_dcf():
    ticker = _normalize_ticker(request.form.get("ticker", ""))
    if not ticker:
        return {"error": "Ticker symbol missing for DCF computation."}, 400

    try:
        fcf_ps = float(request.form.get("fcf_ps"))
        growth_rate = float(request.form.get("growth_rate"))
        terminal_multiple = float(request.form.get("terminal_multiple"))
        years = int(request.form.get("years"))
        cash = float(request.form.get("cash"))
        debt = float(request.form.get("debt"))
        shares = float(request.form.get("shares"))
    except (TypeError, ValueError) as exc:
        return {"error": f"Error parsing DCF parameters: {exc}"}, 400

    if not run_dcf(ticker, fcf_ps, growth_rate, terminal_multiple, years, cash, debt, shares):
        return {"error": "Error computing DCF. Please try again."}, 500

    metrics = load_analysis_data(ticker)
    dcf_results = load_dcf_data(ticker)
    dcf_params = {
        "fcf_ps": fcf_ps,
        "growth_rate": growth_rate,
        "terminal_multiple": terminal_multiple,
        "years": years,
        "cash": cash,
        "debt": debt,
        "shares": shares,
    }

    dcf_html = render_template(
        "partials/_dcf.html",
        ticker=ticker,
        metrics=metrics,
        dcf_results=dcf_results,
        dcf_params=dcf_params,
    )
    return {"dcf_html": dcf_html, "dcf_results": dcf_results}


@bp.route("/reset_cache", methods=["POST"])
def reset_cache():
    ticker = _normalize_ticker(request.form.get("ticker", ""))
    if not ticker:
        flash("Ticker symbol missing for cache reset.")
        return redirect(url_for("web.index"))

    delete_cache_files(ticker)

    if not run_analysis(ticker):
        flash("Error re-running analysis after cache reset.")
        return redirect(url_for("web.index"))

    transcript_data = []
    if not run_transcripts(ticker):
        flash("Error running transcripts analysis after cache reset.")
    else:
        transcript_data = load_transcript_data(ticker)

    metrics = load_analysis_data(ticker)
    if not metrics:
        flash("Analysis data not found after cache reset.")
        return redirect(url_for("web.index"))

    return render_template(
        "result.html",
        ticker=ticker,
        metrics=metrics,
        dcf_results=None,
        dcf_params=None,
        transcript_data=transcript_data,
    )
