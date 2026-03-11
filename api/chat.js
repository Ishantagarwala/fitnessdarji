/**
 * Vercel serverless proxy — forwards requests to OpenAI from the server side,
 * bypassing the browser CORS restriction entirely.
 * The API key travels in the request body over HTTPS and is never stored.
 */
export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } }   // allow base64 images for vision
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const { apiKey, ...openaiBody } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: { message: 'Missing apiKey in request body' } });
  }

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(openaiBody)
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: { message: `Proxy error: ${err.message}` } });
  }
}
