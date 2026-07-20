const STOP = new Set('about after again also and are but can for from have how into just like more not one our out people search that the their then these this through to using was what when where which who why with you your');

export function tokens(value) {
  return (String(value).toLowerCase().match(/[a-z][a-z'-]{2,}/g) || []).filter(word => !STOP.has(word));
}

export function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, value, index) => sum + value * (b[index] || 0), 0);
  const magnitude = vector => Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  const denominator = magnitude(a) * magnitude(b);
  return denominator ? dot / denominator : 0;
}

export function lexicalCandidates(question, signals, limit = 36) {
  const query = new Set(tokens(question));
  return signals
    .map(signal => ({ signal, score: tokens(signal.text).reduce((score, token) => score + (query.has(token) ? 2 : 0), 0) }))
    .sort((a, b) => b.score - a.score || String(b.signal.createdAt).localeCompare(String(a.signal.createdAt)))
    .slice(0, limit)
    .map(({ signal }) => signal);
}
