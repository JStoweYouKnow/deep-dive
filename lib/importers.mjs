const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

function csvRows(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i], next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell); if (row.some(value => clean(value))) rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  row.push(cell); if (row.some(value => clean(value))) rows.push(row);
  return rows;
}

function fromCsv(text) {
  const [header = [], ...rows] = csvRows(text);
  const names = header.map(value => clean(value).toLowerCase());
  const contentIndex = ['text', 'query', 'title', 'content', 'message'].map(key => names.indexOf(key)).find(index => index >= 0) ?? 0;
  const typeIndex = names.indexOf('type');
  const dateIndex = ['createdat', 'created_at', 'time', 'date', 'timestamp'].map(key => names.indexOf(key)).find(index => index >= 0);
  return rows.map(row => ({ text: clean(row[contentIndex]), type: clean(row[typeIndex]) || 'import', createdAt: clean(row[dateIndex]) || undefined }));
}

function fromChatGpt(conversations) {
  return conversations.flatMap(conversation => Object.values(conversation.mapping || {}).flatMap(node => {
    const message = node.message;
    if (message?.author?.role !== 'user') return [];
    const text = clean((message.content?.parts || []).filter(part => typeof part === 'string').join(' '));
    return text ? [{ text: `${conversation.title ? `${conversation.title}: ` : ''}${text}`, type: 'chat', createdAt: message.create_time || conversation.create_time }] : [];
  }));
}

function fromGoogleActivity(items) {
  return items.flatMap(item => {
    const title = clean(item.title);
    const match = title.match(/^(?:Searched for|Search for)\s+(.+)$/i);
    return match ? [{ text: match[1], type: 'search', createdAt: item.time, url: item.titleUrl }] : [];
  });
}

function fromGeneric(items) {
  return items.map(item => ({
    text: clean(item.text || item.query || item.title || item.content || item.message),
    type: clean(item.type) || 'import',
    createdAt: item.createdAt || item.created_at || item.time || item.date,
  }));
}

export function parseImport(content, fileName = '') {
  const name = fileName.toLowerCase();
  if (name.endsWith('.csv')) return fromCsv(content).filter(record => record.text);
  if (!name.endsWith('.json')) return content.split(/\r?\n/).map(text => ({ text: clean(text), type: 'import' })).filter(record => record.text);
  const parsed = JSON.parse(content);
  const items = Array.isArray(parsed) ? parsed : parsed.items || parsed.messages || parsed.conversations || [];
  if (Array.isArray(items) && items.some(item => item?.mapping)) return fromChatGpt(items).filter(record => record.text);
  if (Array.isArray(items) && items.some(item => /^(?:Searched for|Search for)\s+/i.test(clean(item?.title)))) return fromGoogleActivity(items);
  return fromGeneric(Array.isArray(items) ? items : []).filter(record => record.text);
}
