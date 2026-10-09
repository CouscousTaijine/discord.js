const clamp = (s, n) => String(s || '').slice(0, n);
async function timedFetch(url, options = {}, ms = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}
async function askAI(prompt, history = []) {
  const max = Number(process.env.MAX_AI_CHARS || 1800);
  const messages = [
    { role: 'system', content: 'You are Nebula, a helpful, concise Discord assistant. Be accurate and safe.' },
    ...history.slice(-8).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: clamp(m.content, 1200) })),
    { role: 'user', content: clamp(prompt, max) }
  ];
  const timeout = Number(process.env.AI_TIMEOUT_MS || 45000);
  if (process.env.AI_BASE_URL) {
    const base = process.env.AI_BASE_URL.replace(/\/+$/, '');
    const r = await timedFetch(base + '/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(process.env.AI_API_KEY ? { Authorization: 'Bearer ' + process.env.AI_API_KEY } : {}) },
      body: JSON.stringify({ model: process.env.AI_MODEL || 'local-model', messages, temperature: 0.7, max_tokens: 700 })
    }, timeout);
    if (!r.ok) throw new Error('AI endpoint HTTP ' + r.status);
    const data = await r.json();
    return clamp(data.choices?.[0]?.message?.content || 'Empty AI response.', max);
  }
  if (process.env.OLLAMA_URL) {
    const base = process.env.OLLAMA_URL.replace(/\/+$/, '');
    const r = await timedFetch(base + '/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OLLAMA_MODEL || 'qwen2.5:3b', stream: false, messages, options: { temperature: 0.7, num_predict: 700 } })
    }, timeout);
    if (!r.ok) throw new Error('Ollama HTTP ' + r.status + '. Start Ollama and download the model.');
    const data = await r.json();
    return clamp(data.message?.content || 'Empty AI response.', max);
  }
  throw new Error('AI not configured. Install Ollama locally or set AI_BASE_URL.');
}
async function makeImage(prompt) {
  const clean = clamp(prompt, Number(process.env.MAX_IMAGE_PROMPT_CHARS || 500)).trim();
  if (!clean) throw new Error('Please enter an image prompt.');
  const base = (process.env.IMAGE_API_BASE_URL || 'https://image.pollinations.ai/prompt').replace(/\/+$/, '');
  const url = base + '/' + encodeURIComponent(clean) + '?width=1024&height=1024&nologo=true';
  const r = await timedFetch(url, {}, 60000);
  if (!r.ok) throw new Error('Image provider HTTP ' + r.status + '. Try again later.');
  if (!(r.headers.get('content-type') || '').startsWith('image/')) throw new Error('Provider did not return an image.');
  return url;
}
module.exports = { askAI, makeImage };
