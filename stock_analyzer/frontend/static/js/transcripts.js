/**
 * Module: transcripts.js
 * Purpose: Manage transcript selection and AI summary generation.
 * Example: setupTranscripts([]);
 */
let transcriptsCache = [];

function renderTranscript(contentEl, summaryEl, transcript) {
  if (!contentEl || !transcript) {
    return;
  }
  if (summaryEl) {
    summaryEl.innerHTML = '';
  }

  let html = `<p><strong>Period:</strong> Q${transcript.quarter} ${transcript.year}</p>`;
  html += '<div class="transcript">';
  (transcript.transcript || []).forEach(entry => {
    if (entry && entry.speaker && entry.text) {
      html += `<p><strong>${entry.speaker}:</strong> ${entry.text}</p>`;
    }
  });
  html += '</div>';
  contentEl.innerHTML = html;
}

function handleTranscriptChange(event, contentEl, summaryEl) {
  const index = Number(event.target.value);
  const transcript = transcriptsCache[index];
  if (!transcript) {
    return;
  }
  renderTranscript(contentEl, summaryEl, transcript);
}

function handleSummaryRequest({ tickerInput, selectEl, summaryEl }) {
  if (!tickerInput || !summaryEl) {
    return;
  }
  const selectedIndex = selectEl ? Number(selectEl.value) : 0;
  const transcript = transcriptsCache[selectedIndex];
  if (!transcript) {
    summaryEl.innerHTML = '<p>No transcript selected.</p>';
    return;
  }

  const formData = new FormData();
  formData.append('ticker', tickerInput.value);
  formData.append('year', transcript.year);
  formData.append('quarter', transcript.quarter);

  summaryEl.innerHTML = '<p>Generating summary...</p>';
  fetch('/compute_summary', {
    method: 'POST',
    body: formData,
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        summaryEl.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
      } else if (typeof data.summary === 'string') {
        const formatted = data.summary.replace(/\n/g, '<br>');
        summaryEl.innerHTML = `<p><strong>Summary:</strong><br>${formatted}</p>`;
      } else {
        summaryEl.innerHTML = '<p>No summary returned.</p>';
      }
    })
    .catch(error => {
      console.error('Error generating summary:', error);
      summaryEl.innerHTML = '<p style="color:red;">Failed to generate summary.</p>';
    });
}

export function setupTranscripts(transcripts) {
  if (!Array.isArray(transcripts) || transcripts.length === 0) {
    return;
  }
  transcriptsCache = transcripts;

  const selectEl = document.getElementById('transcript-select');
  const summaryEl = document.getElementById('summary-content');
  const contentEl = document.getElementById('transcript-content');
  const summaryBtn = document.getElementById('generate-summary');
  const tickerInput = document.getElementById('transcript-ticker');

  if (!contentEl) {
    return;
  }

  const initialIndex = selectEl ? Number(selectEl.value) : 0;
  const initialTranscript = transcriptsCache[initialIndex] || transcriptsCache[0];
  if (initialTranscript) {
    renderTranscript(contentEl, summaryEl, initialTranscript);
  }

  if (selectEl) {
    selectEl.addEventListener('change', (event) => handleTranscriptChange(event, contentEl, summaryEl));
  }

  if (summaryBtn) {
    summaryBtn.addEventListener('click', () => handleSummaryRequest({ tickerInput, selectEl, summaryEl }));
  }
}
