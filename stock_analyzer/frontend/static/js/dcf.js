// Initialize the DCF chart with the returned results
function initDCFChart(dcfResults) {
    // Sort the DCF result keys (assumed to be numeric years) in ascending order
    const sortedDCF = Object.entries(dcfResults)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    const dcfLabels = sortedDCF.map(entry => entry[0]);
    const dcfData = sortedDCF.map(entry => parseFloat(entry[1].toFixed(2)));

    const canvas = document.getElementById('dcfChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        // Optionally, if you need to destroy an existing chart instance, do so here.
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dcfLabels,
                datasets: [{
                    label: 'Share Price',
                    data: dcfData,
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: 'rgba(41, 128, 185, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#333',
                        titleFont: { size: 14 },
                        bodyFont: { size: 12 }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { font: { family: 'Roboto, sans-serif', size: 12 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { display: false, drawBorder: false },
                        ticks: { font: { family: 'Roboto, sans-serif', size: 12 } }
                    }
                }
            }
        });
    }
}

// Handler for DCF form submission via AJAX.
function dcfFormSubmitHandler(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const spinner = document.getElementById('loading');
    if (spinner) spinner.style.display = 'flex';

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
                if (spinner) spinner.style.display = 'none';
                return;
            }
            // Parse the returned HTML and replace the current DCF partial.
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.dcf_html, 'text/html');
            const newDCF = doc.getElementById('dcf-tab');
            newDCF.style.display = 'block';
            const oldDCF = document.getElementById('dcf-tab');
            if (oldDCF && newDCF) {
                oldDCF.parentNode.replaceChild(newDCF, oldDCF);
            }
            // Reattach the event listener to the new form.
            attachDCFFormListener();

            // Initialize the Chart if dcf_results exist.
            if (data.dcf_results && Object.keys(data.dcf_results).length > 0) {
                initDCFChart(data.dcf_results);
            }
            if (spinner) spinner.style.display = 'none';
        })
        .catch(error => {
            console.error("Error computing DCF:", error);
            if (spinner) spinner.style.display = 'none';
        });
}

// Attach the submit event listener to the DCF form.
function attachDCFFormListener() {
    const dcfForm = document.getElementById('dcf-form');
    if (dcfForm) {
        dcfForm.addEventListener('submit', dcfFormSubmitHandler);
    }
}

// Attach the listener when the DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    attachDCFFormListener();
});
