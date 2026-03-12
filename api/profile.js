/**
 * /api/profile — user profile persistence
 *
 * GET  /api/profile  → load saved S state for the current user
 * POST /api/profile  → upsert S state for the current user
 *
 * Auth: Clerk JWT passed as  Authorization: Bearer <token>
 * DB:   Supabase (service-role key, all access server-side)
 */
import { verifyToken } from '@clerk/backend';
import { createClient }  from '@supabase/supabase-js';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ── helpers ─────────────────────────────────────────────── */
async function getUserId(req) {
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  if (!token) throw { status: 401, message: 'Missing auth token' };

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });
    return payload.sub;               // Clerk user ID
  } catch {
    throw { status: 401, message: 'Invalid or expired token' };
  }
}

function err(res, code, message) {
  return res.status(code).json({ error: message });
}

/* ── handler ─────────────────────────────────────────────── */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let userId;
  try {
    userId = await getUserId(req);
  } catch (e) {
    return err(res, e.status || 401, e.message);
  }

  /* ── GET — load profile ─────────────────────────────────── */
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('profiles')
      .select('state, plans')
      .eq('user_id', userId)
      .single();

    if (error?.code === 'PGRST116') return res.status(404).json({ state: null });
    if (error) return err(res, 500, error.message);

    return res.status(200).json(data);
  }

  /* ── POST — save profile ────────────────────────────────── */
  if (req.method === 'POST') {
    const { state, plans } = req.body ?? {};
    if (!state) return err(res, 400, 'Missing state in body');

    const { error } = await supabase
      .from('profiles')
      .upsert(
        { user_id: userId, state, plans: plans ?? {}, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    if (error) return err(res, 500, error.message);
    return res.status(200).json({ ok: true });
  }

  return err(res, 405, 'Method not allowed');
}
