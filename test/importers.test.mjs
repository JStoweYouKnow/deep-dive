import test from 'node:test';
import assert from 'node:assert/strict';
import { parseImport } from '../lib/importers.mjs';

test('imports quoted CSV searches without splitting their commas', () => {
  const records = parseImport('query,time\n"cities, climate resilience",2026-07-19', 'history.csv');
  assert.deepEqual(records, [{ text: 'cities, climate resilience', type: 'import', createdAt: '2026-07-19' }]);
});

test('imports Google Takeout search activity', () => {
  const records = parseImport(JSON.stringify([{ title: 'Searched for human judgment AI', time: '2026-07-19T12:00:00Z' }]), 'MyActivity.json');
  assert.deepEqual(records, [{ text: 'human judgment AI', type: 'search', createdAt: '2026-07-19T12:00:00Z', url: undefined }]);
});

test('imports user excerpts from a ChatGPT export', () => {
  const payload = [{ title: 'Decision making', create_time: 10, mapping: { one: { message: { author: { role: 'user' }, create_time: 11, content: { parts: ['How does bias affect experts?'] } } } } }];
  assert.deepEqual(parseImport(JSON.stringify(payload), 'conversations.json'), [{ text: 'Decision making: How does bias affect experts?', type: 'chat', createdAt: 11 }]);
});
