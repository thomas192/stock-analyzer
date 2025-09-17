"""Run the stock analyzer Flask application."""
from __future__ import annotations

from stock_analyzer import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
