/* ══════════════════════════════════════════════════════
   AI MODEL SELECTOR
   Key lives in ZENMUX_API_KEY env var on Vercel — never in the browser.
   Model names follow ZenMux's provider/model format.
══════════════════════════════════════════════════════ */
let AI_MODEL = 'openai/gpt-4o';

function setModel(val) {
  AI_MODEL = val;
  showNotif(`Model → ${val}`, 'ZenMux');
}

/* ══════════════════════════════════════════════════════
   ERROR PARSER
══════════════════════════════════════════════════════ */
async function parseAIError(res) {
  let body = {};
  try { body = await res.json(); } catch(_) {}
  const msg = body.error?.message || res.statusText || 'Unknown error';
  const code = body.error?.code || '';

  if (res.status === 500 && msg.includes('ZENMUX_API_KEY')) {
    return `Server not configured — add <strong>ZENMUX_API_KEY</strong> in your Vercel dashboard under Settings → Environment Variables, then redeploy.`;
  }
  if (res.status === 429) {
    const retryAfter = res.headers.get('retry-after');
    const retryMsg = retryAfter ? ` Retry in <strong>${retryAfter}s</strong>.` : '';
    return `429 Rate limit hit on <strong>${AI_MODEL}</strong>.${retryMsg} Try switching to a faster model like <strong>openai/gpt-4o-mini</strong>.`;
  }
  if (res.status === 401) return `401 Invalid API key — check ZENMUX_API_KEY in Vercel env vars.`;
  if (res.status === 400) return `400 Bad Request — ${msg}`;
  return `${res.status}: ${msg}`;
}

/* ══════════════════════════════════════════════════════
   AI API — routed through /api/chat (Vercel → ZenMux)
   Same-origin call from browser → no CORS issue at all.
══════════════════════════════════════════════════════ */
async function callAPI(prompt) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048
    })
  });
  if (!res.ok) throw new Error(await parseAIError(res));
  const d = await res.json();
  return d.choices?.[0]?.message?.content ?? '';
}

async function callVisionAPI(prompt, b64) {
  /* Vision needs a model that supports image input */
  const visionModel = AI_MODEL.includes('gpt-3.5')
    ? 'openai/gpt-4o'
    : AI_MODEL;

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
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
  if (!res.ok) throw new Error(await parseAIError(res));
  const d = await res.json();
  return d.choices?.[0]?.message?.content ?? '';
}

/* ══════════════════════════════════════════════════════
   JSON HELPERS
══════════════════════════════════════════════════════ */
function parseArr(raw) {
  const s=raw.indexOf('['), e=raw.lastIndexOf(']');
  return JSON.parse(raw.slice(s,e+1));
}
function parseObj(raw) {
  const s=raw.indexOf('{'), e=raw.lastIndexOf('}');
  return JSON.parse(raw.slice(s,e+1));
}
