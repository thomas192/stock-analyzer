// Ensure that global historicalData exists (set from the template)
if (window.historicalData) {
  const historicalData = window.historicalData;
  const years = historicalData.map(item => item.year);
  let metricChart;

  // Function to create (or recreate) the Chart.js chart
  function createChart(chartType, metricField, chartTitle) {
    const canvas = document.getElementById('metricChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dataValues = historicalData.map(item => item[metricField]);
    if (metricChart) {
      metricChart.destroy();
    }
    metricChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: years,
        datasets: [{
          label: chartTitle,
          data: dataValues,
          backgroundColor: chartType === 'bar' ? 'rgba(54, 162, 235, 0.6)' : 'rgba(75, 192, 192, 0.6)',
          borderColor: chartType === 'bar' ? 'rgba(54, 162, 235, 1)' : 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          borderRadius: chartType === 'bar' ? 4 : 0,
          fill: false,
          tension: chartType === 'line' ? 0.1 : 0
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

  // Attach event listeners once the DOM is loaded
  document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('chartModal');
    const chartTitleElem = document.getElementById('chartTitle');
    const closeModal = document.querySelector('.close-modal');

    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });

    // For every clickable metric card, attach a click listener to open the modal and create the chart
    document.querySelectorAll('.clickable').forEach(card => {
      card.addEventListener('click', function () {
        const metricField = this.getAttribute('data-metric');
        const chartType = this.getAttribute('data-chart-type');
        const title = this.getAttribute('data-title');
        chartTitleElem.textContent = title;
        createChart(chartType, metricField, title);
        modal.style.display = 'flex';
      });
    });
  });
}
