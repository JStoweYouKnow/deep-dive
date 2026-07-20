import { generateText } from 'ai';

const MAX_SIGNALS = 18;
const MAX_SIGNAL_CHARS = 700;

function sanitizeSignals(signals) {
  if (!Array.isArray(signals)) return [];
  return signals
    .slice(0, MAX_SIGNALS)
    .map((signal, index) => ({
      id: `S${index + 1}`,
      type: String(signal.type || 'trace').slice(0, 40),
      text: String(signal.text || '').replace(/\s+/g, ' ').trim().slice(0, MAX_SIGNAL_CHARS),
      createdAt: String(signal.createdAt || '').slice(0, 30),
    }))
    .filter((signal) => signal.text);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const question = String(request.body?.question || '').trim().slice(0, 800);
  const signals = sanitizeSignals(request.body?.signals);
  if (!question || !signals.length) {
    return response.status(400).json({ error: 'A question and at least one research signal are required.' });
  }

  const evidence = signals
    .map((signal) => `[${signal.id}] ${signal.type}${signal.createdAt ? `, ${signal.createdAt}` : ''}: ${signal.text}`)
    .join('\n');

  try {
    const result = await generateText({
      model: 'openai/gpt-5.4',
      system: `You are Deep Dive, a private research-memory assistant. Answer only from the supplied research signals. Be concise, intellectually honest, and useful. Cite every factual claim about the user's trail with one or more source labels like [S1]. If the signals do not support an answer, say so plainly and suggest a useful next question. Do not invent sources, history, or preferences.`,
      prompt: `Question: ${question}\n\nResearch signals:\n${evidence}`,
      temperature: 0.3,
    });

    const citations = [...new Set((result.text.match(/\[S\d+\]/g) || []))]
      .filter((citation) => signals.some((signal) => `[${signal.id}]` === citation));
    return response.status(200).json({ answer: result.text, citations });
  } catch (error) {
    console.error('Deep Dive ask route failed', error);
    return response.status(502).json({ error: 'Deep Dive could not reach the language model. Your local trail was not changed.' });
  }
}
