import os
import json
import papermill as pm
from flask import Flask, request, render_template, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = 'secret_key'  # Needed for flash messages

# Directory where the JSON files are stored
ANALYSIS_FOLDER = os.path.join(os.getcwd(), 'analysis')


def run_analysis(ticker: str) -> bool:
    """
    Runs the parameterized notebook using Papermill with the given ticker.
    Returns True if the notebook executed without error.
    """
    try:
        pm.execute_notebook(
            'analyze_stock.ipynb',
            None,
            parameters={'ticker': ticker}
        )
        return True
    except Exception as e:
        # Log or print error as needed
        print(f"Error running notebook: {e}")
        return False


def load_analysis_data(ticker: str) -> dict:
    """
    Loads the JSON analysis data from the file generated by the notebook.
    Returns an empty dictionary if the file does not exist.
    """
    json_path = os.path.join(ANALYSIS_FOLDER, f'{ticker}.json')
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            return json.load(f)
    return {}


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        ticker = request.form.get('ticker', '').upper().strip()
        if not ticker:
            flash('Ticker symbol is required.')
            return redirect(url_for('index'))

        # Run the analysis notebook
        if not run_analysis(ticker):
            flash('There was an error running the analysis.')
            return redirect(url_for('index'))

        # Load the analysis data from the generated JSON file
        metrics = load_analysis_data(ticker)
        if not metrics:
            flash('Analysis data not found. Please try again.')
            return redirect(url_for('index'))

        # Pass the ticker and metrics to the result template for visualization
        return render_template('result.html', ticker=ticker, metrics=metrics)

    # GET request: render the form template
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
