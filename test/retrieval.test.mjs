import test from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity, lexicalCandidates } from '../lib/retrieval.mjs';

test('cosine similarity ranks aligned vectors above unrelated vectors', () => {
  assert.ok(cosineSimilarity([1, 0, 1], [1, 0, 1]) > cosineSimilarity([1, 0, 1], [0, 1, 0]));
});

test('lexical candidates prioritise matching signals then recency', () => {
  const signals = [
    { text: 'urban libraries', createdAt: '2026-07-01' },
    { text: 'AI judgment research', createdAt: '2026-07-02' },
    { text: 'AI judgment case study', createdAt: '2026-07-03' },
  ];
  assert.deepEqual(lexicalCandidates('AI judgment', signals, 2).map(signal => signal.text), ['AI judgment case study', 'AI judgment research']);
});
