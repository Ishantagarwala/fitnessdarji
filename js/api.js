/* ══════════════════════════════════════════════════════
   OPENAI API KEY & MODEL
══════════════════════════════════════════════════════ */
let OPENAI_KEY = '';
let OPENAI_MODEL = 'gpt-4o';

function setKey(val) {
  OPENAI_KEY = val.trim();
  const st = document.getElementById('key-status');
  if (!st) return;
  if (OPENAI_KEY.startsWith('sk-') && OPENAI_KEY.length > 20) {
    st.textContent = '✓ key set';
    st.className = 'ok';
  } else if (OPENAI_KEY.length > 0) {
    st.textContent = '…';
    st.className = '';
  } else {
    st.textContent = '';
    st.className = '';
  }
}

function setModel(val) {
  OPENAI_MODEL = val;
  showNotif(`Model → ${val}`, 'OpenAI');
}

/* Parse OpenAI error responses into readable messages */
async function parseOpenAIError(res) {
  let body = {};
  try { body = await res.json(); } catch(_) {}
  const msg = body.error?.message || res.statusText || 'Unknown error';
  const code = body.error?.code || '';
  if (res.status === 429) {
    const retryAfter = res.headers.get('retry-after');
    const retryMsg = retryAfter ? ` Retry in <strong>${retryAfter}s</strong>.` : '';
    if (code === 'insufficient_quota') {
      return `429 Quota exceeded — your OpenAI account has run out of credits. Add billing at <a href="https://platform.openai.com/account/billing" target="_blank" style="color:var(--accent4)">platform.openai.com</a>.${retryMsg}`;
    }
    return `429 Rate limit hit on <strong>${OPENAI_MODEL}</strong>.${retryMsg} Try <strong>gpt-4o-mini</strong> for higher rate limits.`;
  }
  if (res.status === 401) return `401 Invalid API key — check the key you pasted in the header bar.`;
  if (res.status === 400) return `400 Bad Request — ${msg}`;
  if (res.status === 403) return `403 Forbidden — ${msg}`;
  return `${res.status}: ${msg}`;
}

/* ══════════════════════════════════════════════════════
   AI API — routed through /api/chat (Vercel serverless proxy)
   Same-origin call → no CORS, key never stored server-side
══════════════════════════════════════════════════════ */
async function callAPI(prompt) {
  if (!OPENAI_KEY) throw new Error('No OpenAI API key — paste your key (sk-…) in the header bar.');
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: OPENAI_KEY,
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048
    })
  });
  if (!res.ok) throw new Error(await parseOpenAIError(res));
  const d = await res.json();
  return d.choices?.[0]?.message?.content ?? '';
}

async function callVisionAPI(prompt, b64) {
  if (!OPENAI_KEY) throw new Error('No OpenAI API key — paste your key (sk-…) in the header bar.');
  /* GPT-3.5 Turbo does not support vision — fall back to gpt-4o */
  const visionModel = OPENAI_MODEL === 'gpt-3.5-turbo' ? 'gpt-4o' : OPENAI_MODEL;
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: OPENAI_KEY,
      model: visionModel,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } }
        ]
      }],
      temperature: 0.4,
      max_tokens: 2048
    })
  });
  if (!res.ok) throw new Error(await parseOpenAIError(res));
  const d = await res.json();
  return d.choices?.[0]?.message?.content ?? '';
}

function parseArr(raw) {
  const s=raw.indexOf('['), e=raw.lastIndexOf(']');
  return JSON.parse(raw.slice(s,e+1));
}
function parseObj(raw) {
  const s=raw.indexOf('{'), e=raw.lastIndexOf('}');
  return JSON.parse(raw.slice(s,e+1));
}
