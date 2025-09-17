"""Stock analyzer web application factory.

Example:
    >>> from stock_analyzer import create_app
    >>> app = create_app()
    >>> app.name
    'stock_analyzer'
"""
from __future__ import annotations

from flask import Flask

from .config import STATIC_DIR, TEMPLATE_DIR, get_secret_key
from .web import register_routes


def create_app() -> Flask:
    """Create and configure a Flask application instance."""
    app = Flask(
        __name__,
        template_folder=str(TEMPLATE_DIR),
        static_folder=str(STATIC_DIR),
    )
    app.secret_key = get_secret_key()
    register_routes(app)
    return app
