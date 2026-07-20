import('./lib/importers.mjs').then((module) => { window.DeepDiveImporters = module; });

window.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'deep-dive-studio-v2';
  const form = document.querySelector('#ask-form');
  const input = document.querySelector('#ask-input');
  const answer = document.querySelector('#ask-answer');
  const stop = new Set('about after again also and are but can for from have how into just like more not one our out people search that the their then these this through to using was what when where which who why with you your');

  function tokens(value) {
    return (String(value).toLowerCase().match(/[a-z][a-z'-]{2,}/g) || []).filter((word) => !stop.has(word));
  }
  function getSignals() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').signals || []; }
    catch { return []; }
  }
  function retrieve(question, signals) {
    const query = tokens(question);
    return signals
      .map((signal) => ({ signal, score: tokens(signal.text).reduce((score, token) => score + (query.includes(token) ? 2 : 0), 0) }))
      .sort((a, b) => b.score - a.score || String(b.signal.createdAt).localeCompare(String(a.signal.createdAt)))
      .slice(0, 36)
      .map(({ signal }) => signal);
  }
  function escape(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }
  function show(message, className = '') {
    answer.hidden = false;
    answer.className = `answer ${className}`;
    answer.innerHTML = message;
  }
  function appendPrivacyNotice() {
    const steps = document.querySelector('#onboarding .privacy-steps');
    if (!steps || steps.querySelector('[data-llm-notice]')) return;
    const item = document.createElement('div');
    item.dataset.llmNotice = 'true';
    item.innerHTML = '<b>4</b><span><strong>Ask with consent</strong>Choosing “Ask your trail” sends up to 36 relevant signals for semantic retrieval and one grounded answer.</span>';
    steps.append(item);
  }

  appendPrivacyNotice();
  const importHelper = document.querySelector('#activity-file')?.closest('[data-panel]')?.querySelector('.helper');
  if (importHelper) importHelper.innerHTML = 'Import <strong>Google Takeout</strong> search activity (<code>MyActivity.json</code>), a <strong>ChatGPT</strong> export (<code>conversations.json</code>), or a text/CSV/JSON file. Export files are read only in this browser.';
  if (!form || !input || !answer) return;
  form.onsubmit = async (event) => {
    event.preventDefault();
    const signals = retrieve(input.value, getSignals());
    if (!signals.length) {
      show('Add a search, chat excerpt, note, or saved page before asking your trail.', 'answer-error');
      return;
    }
    const consentKey = 'deep-dive-llm-consent';
    if (!localStorage.getItem(consentKey)) {
      const accepted = window.confirm('Ask your trail will send up to 36 relevant signals for semantic retrieval and one grounded answer. Your full local trail is not uploaded. Continue?');
      if (!accepted) return;
      localStorage.setItem(consentKey, 'true');
    }
    const submit = form.querySelector('button');
    submit.disabled = true;
    submit.textContent = 'Reading your trail…';
    show('<span class="answer-loading">Deep Dive is grounding an answer in your selected signals…</span>', 'answer-loading-wrap');
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input.value, signals }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'The language model is unavailable.');
      const citationList = payload.citations?.length ? `<div class="citation-list">Grounded in ${payload.citations.map((citation) => `<span>${escape(citation)}</span>`).join('')}</div>` : '';
      show(`<div class="llm-answer">${escape(payload.answer).replace(/\n/g, '<br>')}</div>${citationList}`);
    } catch (error) {
      show(`${escape(error.message)} You can still inspect the local evidence in your threads.`, 'answer-error');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Ask';
    }
  };
});
