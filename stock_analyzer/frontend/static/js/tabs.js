/**
 * Module: tabs.js
 * Purpose: Handle tab navigation between analysis sections.
 * Example: initTabs();
 */
export function initTabs() {
  const tabButtons = document.querySelectorAll('.tablink');
  const tabContents = document.querySelectorAll('.tabcontent');
  if (!tabButtons.length || !tabContents.length) {
    return;
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.tab;
      if (!targetId) {
        return;
      }

      tabButtons.forEach(btn => btn.classList.toggle('active', btn === button));
      tabContents.forEach(content => {
        content.style.display = content.id === targetId ? 'block' : 'none';
      });
    });
  });
}
