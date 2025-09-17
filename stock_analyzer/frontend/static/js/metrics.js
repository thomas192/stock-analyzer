const percentUnits = 'percent';

if (window.historicalData) {
  const historicalData = window.historicalData;
  const years = historicalData.map(item => item.year);
  const trendMap = window.metricTrends || {};
  let metricChart;


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

  function formatTrendValue(value, units) {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return null;
    }
    if (units === percentUnits) {
      return `${(value * 100).toFixed(2)}%`;
    }
    return Number.isFinite(value) ? value.toFixed(2) : null;
  }

  function renderTrendBadges(container, trendData, units = 'number') {
    if (!container) {
      return;
    }
    container.innerHTML = '';
    container.style.display = 'none';
    if (!trendData) {
      return;
    }

    const entries = Object.entries(trendData).filter(([, val]) => val !== null && val !== undefined && !Number.isNaN(val));
    entries.sort((a, b) => {
      const yearsA = parseInt(a[0].replace(/[^0-9]/g, ''), 10) || 0;
      const yearsB = parseInt(b[0].replace(/[^0-9]/g, ''), 10) || 0;
      return yearsB - yearsA;
    });
    if (!entries.length) {
      return;
    }

    entries.forEach(([label, rawValue]) => {
      const displayValue = formatTrendValue(rawValue, units);
      if (!displayValue) {
        return;
      }
      const badge = document.createElement('div');
      badge.classList.add('trend-badge');
      const numericValue = Number(rawValue);
      if (!Number.isNaN(numericValue)) {
        if (numericValue > 0) {
          badge.classList.add('positive');
        } else if (numericValue < 0) {
          badge.classList.add('negative');
        }
      }
      badge.textContent = `${label}: ${displayValue}`;
      container.appendChild(badge);
    });

    if (container.childElementCount > 0) {
      container.style.display = 'flex';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('chartModal');
    const chartTitleElem = document.getElementById('chartTitle');
    const closeModal = document.querySelector('.close-modal');
    const trendContainer = document.getElementById('trendBadges');

    function hideModal() {
      if (modal) {
        modal.style.display = 'none';
      }
      renderTrendBadges(trendContainer, null);
    }

    if (closeModal) {
      closeModal.addEventListener('click', hideModal);
    }
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        hideModal();
      }
    });

    document.querySelectorAll('.clickable').forEach(card => {
      card.addEventListener('click', function () {
        const metricField = this.getAttribute('data-metric');
        const chartType = this.getAttribute('data-chart-type');
        const title = this.getAttribute('data-title');
        const trendKey = this.getAttribute('data-trend-key');
        const units = this.getAttribute('data-trend-units') || 'number';
        const trendData = trendKey ? trendMap[trendKey] || null : null;

        if (chartTitleElem) {
          chartTitleElem.textContent = title;
        }
        createChart(chartType, metricField, title);
        renderTrendBadges(trendContainer, trendData, units);
        if (modal) {
          modal.style.display = 'flex';
        }
      });
    });
  });
}

