/**
 * Vercel serverless proxy → ZenMux AI
 *
 * ZenMux is OpenAI-compatible, so the request/response shape is identical.
 * The API key is read from the ZENMUX_API_KEY environment variable set in
 * the Vercel dashboard — it is never exposed to the browser.
 *
 * Endpoint: https://zenmux.ai/api/v1/chat/completions
 * Docs:     https://docs.zenmux.ai
 */
export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } }  // allow base64 images for vision
};

const ZENMUX_URL = 'https://zenmux.ai/api/v1/chat/completions';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ZENMUX_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'ZENMUX_API_KEY is not set. Add it in the Vercel dashboard → Settings → Environment Variables.' }
    });
  }

  // Strip apiKey from body if the client accidentally sent it (backwards compat)
  const { apiKey: _unused, ...body } = req.body;

  try {
    const upstream = await fetch(ZENMUX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: { message: `Proxy error: ${err.message}` } });
  }
}
