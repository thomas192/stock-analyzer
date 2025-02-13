document.addEventListener('DOMContentLoaded', function () {
    // Handle transcript content selection
    const transcriptSelect = document.getElementById('transcript-select');
    if (transcriptSelect) {
        transcriptSelect.addEventListener('change', function () {
            // Clear the current AI summary when switching transcripts.
            document.getElementById('summary-content').innerHTML = '';

            const transcripts = window.transcriptsData;
            const index = this.value;
            const selectedTranscript = transcripts[index];
            let html = `<p><strong>Period:</strong> Q${selectedTranscript.quarter} ${selectedTranscript.year}</p>`;
            html += '<div class="transcript">';
            selectedTranscript.transcript.forEach(function (entry) {
                html += `<p><strong>${entry.speaker}:</strong> ${entry.text}</p>`;
            });
            html += '</div>';
            document.getElementById('transcript-content').innerHTML = html;
        });
    }

    // Handle AI Summary generation
    const summaryButton = document.getElementById('generate-summary');
    if (summaryButton) {
        summaryButton.addEventListener('click', function () {
            const ticker = document.getElementById('transcript-ticker').value;
            const selectedIndex = transcriptSelect ? transcriptSelect.value : 0;
            const selectedTranscript = window.transcriptsData[selectedIndex];
            const year = selectedTranscript.year;
            const quarter = selectedTranscript.quarter;

            // Show a temporary loading message.
            const summaryDiv = document.getElementById('summary-content');
            summaryDiv.innerHTML = '<p>Generating summary...</p>';

            // Prepare the parameters for the AJAX POST.
            const formData = new FormData();
            formData.append('ticker', ticker);
            formData.append('year', year);
            formData.append('quarter', quarter);

            fetch('/compute_summary', {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        summaryDiv.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
                    } else {
                        const formattedSummary = data.summary.replace(/\n/g, '<br>');
                        summaryDiv.innerHTML = `<p><strong>Summary:</strong><br>${formattedSummary}</p>`;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    }
});
