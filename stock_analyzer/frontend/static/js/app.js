/**
 * Module: app.js
 * Purpose: Frontend entry point wiring page features together.
 * Example: Imported automatically via base template.
 */
import { initTabs } from './tabs.js';
import { setupDcfForm } from './dcf.js';
import { initMetricInteractions } from './metrics.js';
import { setupTranscripts } from './transcripts.js';

function parseJsonScript(id) {
  const el = document.getElementById(id);
  if (!el) {
    return null;
  }
  try {
    return JSON.parse(el.textContent);
  } catch (error) {
    console.error(`Failed to parse JSON from #${id}`, error);
    return null;
  }
}

function initLoadingIndicators() {
  const forms = document.querySelectorAll('form[data-loading-target]');
  if (!forms.length) {
    return;
  }
  forms.forEach(form => {
    const targetId = form.dataset.loadingTarget;
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) {
      return;
    }
    form.addEventListener('submit', () => {
      target.style.display = 'flex';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoadingIndicators();
  initTabs();

  const historicalMetrics = parseJsonScript('historical-metrics-data');
  const trendWindows = parseJsonScript('metric-trends-data') || {};
  if (Array.isArray(historicalMetrics) && historicalMetrics.length) {
    initMetricInteractions({ historicalData: historicalMetrics, trendMap: trendWindows || {} });
  }

  const dcfResults = parseJsonScript('dcf-results-data');
  setupDcfForm(dcfResults);

  const transcriptsData = parseJsonScript('transcripts-data');
  if (Array.isArray(transcriptsData) && transcriptsData.length) {
    setupTranscripts(transcriptsData);
  }
});
