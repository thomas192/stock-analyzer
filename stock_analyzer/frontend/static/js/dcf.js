/**
 * Module: dcf.js
 * Purpose: Manage DCF form submission and valuation chart rendering.
 * Example: setupDcfForm(null);
 */
let dcfChart = null;

function renderDcfChart(dcfResults) {
  if (!dcfResults || typeof dcfResults !== 'object') {
    return;
  }
  const canvas = document.getElementById('dcfChart');
  if (!canvas) {
    return;
  }
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js is required to render DCF charts.');
    return;
  }

  const sorted = Object.entries(dcfResults)
    .map(([year, value]) => [year, Number(value)])
    .filter(([, value]) => Number.isFinite(value))
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  if (!sorted.length) {
    return;
  }

  const labels = sorted.map(([year]) => year);
  const values = sorted.map(([, value]) => Number(value.toFixed(2)));

  if (dcfChart) {
    dcfChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  dcfChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Share Price',
        data: values,
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

function attachDcfForm(form) {
  if (!form || form.dataset.listenerBound === 'true') {
    return;
  }
  form.addEventListener('submit', handleFormSubmit);
  form.dataset.listenerBound = 'true';
}

function replaceDcfTab(htmlFragment) {
  if (!htmlFragment) {
    return null;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlFragment, 'text/html');
  const incomingTab = doc.getElementById('dcf-tab');
  if (!incomingTab) {
    return null;
  }
  incomingTab.style.display = 'block';
  const currentTab = document.getElementById('dcf-tab');
  if (currentTab && currentTab.parentNode) {
    currentTab.parentNode.replaceChild(incomingTab, currentTab);
  }
  return incomingTab;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const spinner = document.getElementById('loading');
  if (spinner) {
    spinner.style.display = 'flex';
  }

  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error(data.error);
        return;
      }
      const updatedTab = replaceDcfTab(data.dcf_html);
      if (updatedTab) {
        const updatedForm = updatedTab.querySelector('#dcf-form');
        attachDcfForm(updatedForm);
      }
      if (data.dcf_results) {
        renderDcfChart(data.dcf_results);
      }
    })
    .catch(error => {
      console.error('Error computing DCF:', error);
    })
    .finally(() => {
      if (spinner) {
        spinner.style.display = 'none';
      }
    });
}

export function setupDcfForm(initialResults) {
  const form = document.getElementById('dcf-form');
  attachDcfForm(form);
  if (initialResults && Object.keys(initialResults).length > 0) {
    renderDcfChart(initialResults);
  }
}
