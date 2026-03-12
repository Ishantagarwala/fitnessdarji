/* ══════════════════════════════════════════════════════
   AUTH — Clerk (email + Google OAuth)
   Publishable key read from <meta name="clerk-pk">

   Fallback chain (no blank page ever):
     1. Clerk key missing / placeholder → skip auth, show app
     2. Clerk CDN blocked / failed      → skip auth, show app
     3. Clerk loaded, user signed in    → load profile, show app
     4. Clerk loaded, no session        → show sign-in page
     5. 8-second safety timeout         → skip auth, show app
══════════════════════════════════════════════════════ */
let clerk = null;

const CLERK_APPEARANCE = {
  variables: {
    colorBackground:      '#0e1418',
    colorInputBackground: '#141c22',
    colorInputText:       '#e8f4f0',
    colorText:            '#e8f4f0',
    colorTextSecondary:   '#5a7a8a',
    colorPrimary:         '#00e5c0',
    colorDanger:          '#ff4d6d',
    colorSuccess:         '#00e5c0',
    colorNeutral:         '#1e2d38',
    borderRadius:         '10px',
    fontFamily:           "'Space Mono', monospace",
    fontFamilyButtons:    "'Syne', sans-serif",
    fontSize:             '14px',
  },
  elements: {
    card:                      'clerk-card',
    headerTitle:               'clerk-header-title',
    formButtonPrimary:         'clerk-btn-primary',
    footerActionLink:          'clerk-footer-link',
    socialButtonsBlockButton:  'clerk-social-btn',
  }
};

/* ── entry point (called from main.js) ──────────────────── */
async function initAuth() {
  /* Safety net — if auth hangs for any reason, show app after 8s */
  const fallbackTimer = setTimeout(() => {
    console.warn('[auth] Timeout — showing app without auth');
    showAppNoAuth();
  }, 8000);

  const pk = document.querySelector('meta[name="clerk-pk"]')?.content;

  /* Case 1: key not configured */
  if (!pk || pk.startsWith('YOUR_') || pk.trim() === '') {
    clearTimeout(fallbackTimer);
    console.warn('[auth] No Clerk key — running without auth');
    showAppNoAuth();
    return;
  }

  /* Case 2: Clerk CDN didn't load (ad-blocker, network, etc.) */
  if (typeof window.Clerk === 'undefined') {
    clearTimeout(fallbackTimer);
    console.warn('[auth] Clerk SDK not available — running without auth');
    showAppNoAuth();
    return;
  }

  try {
    clerk = new window.Clerk(pk);
    await clerk.load();
    clearTimeout(fallbackTimer);
  } catch (e) {
    clearTimeout(fallbackTimer);
    console.error('[auth] Clerk.load() failed:', e);
    showAppNoAuth();
    return;
  }

  /* Listen for session changes (sign-in / sign-out) */
  clerk.addListener(({ user }) => {
    if (user) onSignedIn();
    else      onSignedOut();
  });

  /* Initial state */
  if (clerk.user) onSignedIn();
  else            onSignedOut();
}

/* ── no-auth fallback ───────────────────────────────────── */
function showAppNoAuth() {
  hideAuthLoader();
  showPage('app');
  goStep(1);
}

/* ── signed-in ──────────────────────────────────────────── */
async function onSignedIn() {
  showPage('app');
  mountUserButton();
  showAuthLoader('Loading your profile…');

  try {
    const saved = await loadProfile();
    hideAuthLoader();

    if (saved) {
      Object.assign(S, saved);
      showNotif('Welcome back! 👋', clerk.user.firstName || 'दर्जी');
      renderDots(STEPS + 1);
      document.getElementById('onboarding').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      buildDashboard();
    } else {
      goStep(1);
    }
  } catch (e) {
    console.error('[auth] profile load error:', e);
    hideAuthLoader();
    goStep(1);
  }
}

/* ── signed-out ─────────────────────────────────────────── */
function onSignedOut() {
  /* Reset in-memory state for next sign-in */
  Object.assign(S, {
    age:null, gender:null, height:null, weight:null,
    activity:null, actMult:1.55, goal:0, goalLabel:'Maintain',
    diet:null, pantry:[], targetWeight:null, pace:.5
  });

  showPage('auth-page');
  hideAuthLoader();

  const container = document.getElementById('clerk-sign-in');
  if (container) {
    container.innerHTML = '';
    clerk.mountSignIn(container, { appearance: CLERK_APPEARANCE });
  }
}

/* ── helpers ────────────────────────────────────────────── */
function mountUserButton() {
  const slot = document.getElementById('user-btn-slot');
  if (slot && !slot.hasChildNodes() && clerk) {
    clerk.mountUserButton(slot, { appearance: CLERK_APPEARANCE });
  }
}

async function getAuthToken() {
  if (!clerk?.session) return null;
  try { return await clerk.session.getToken(); }
  catch { return null; }
}

function showPage(id) {
  ['app', 'auth-page'].forEach(p => {
    const el = document.getElementById(p);
    if (el) el.style.display = (p === id) ? 'block' : 'none';
  });
}

function showAuthLoader(msg = 'Initialising…') {
  const el = document.getElementById('auth-loader');
  if (!el) return;
  el.style.display = 'flex';
  const t = el.querySelector('.auth-loader-txt');
  if (t) t.textContent = msg;
}

function hideAuthLoader() {
  const el = document.getElementById('auth-loader');
  if (el) el.style.display = 'none';
}
