window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('.trail-canvas');
  const timeline = document.querySelector('#timeline');
  const threadGrid = document.querySelector('#thread-grid');
  const storageKey = 'deep-dive-studio-v2';

  function recentSignals() {
    try { return (JSON.parse(localStorage.getItem(storageKey) || '{}').signals || []).slice(-3); }
    catch { return []; }
  }
  function refreshCanvas() {
    const signals = recentSignals();
    if (!canvas || !signals.length) return;
    canvas.querySelectorAll('.scrap').forEach((card, index) => {
      const signal = signals[index];
      if (!signal) return;
      card.querySelector('small').textContent = signal.type || 'trace';
      card.querySelector('p').textContent = signal.text.length > 62 ? `${signal.text.slice(0, 62)}…` : signal.text;
    });
  }
  function annotateThreads() {
    document.querySelectorAll('.thread-card').forEach((card, index) => {
      const note = card.querySelector('.field-note');
      if (note) return;
      const signal = recentSignals()[index];
      if (!signal) return;
      const tag = document.createElement('span');
      tag.className = 'field-note';
      tag.textContent = `“${signal.text.slice(0, 46)}${signal.text.length > 46 ? '…' : ''}”`;
      card.querySelector('p')?.after(tag);
    });
  }
  function animateNewTraces() {
    document.querySelectorAll('.trace:not([data-studio-trace])').forEach(trace => {
      trace.dataset.studioTrace = 'true';
      trace.classList.add('arriving');
      window.setTimeout(() => trace.classList.remove('arriving'), 650);
    });
    refreshCanvas(); annotateThreads();
  }
  new MutationObserver(animateNewTraces).observe(timeline, { childList: true, subtree: true });
  new MutationObserver(annotateThreads).observe(threadGrid, { childList: true, subtree: true });
  refreshCanvas(); annotateThreads(); animateNewTraces();
});
