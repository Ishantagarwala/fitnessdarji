/* ══════════════════════════════════════════════════════
   AUTH — Clerk (email + Google OAuth)
   Publishable key read from <meta name="clerk-pk">
══════════════════════════════════════════════════════ */
let clerk = null;

const CLERK_APPEARANCE = {
  variables: {
    colorBackground:       '#0e1418',
    colorInputBackground:  '#141c22',
    colorInputText:        '#e8f4f0',
    colorText:             '#e8f4f0',
    colorTextSecondary:    '#5a7a8a',
    colorPrimary:          '#00e5c0',
    colorDanger:           '#ff4d6d',
    colorSuccess:          '#00e5c0',
    colorNeutral:          '#1e2d38',
    borderRadius:          '10px',
    fontFamily:            "'Space Mono', monospace",
    fontFamilyButtons:     "'Syne', sans-serif",
    fontSize:              '14px',
  },
  elements: {
    card:               'clerk-card',
    headerTitle:        'clerk-header-title',
    formButtonPrimary:  'clerk-btn-primary',
    footerActionLink:   'clerk-footer-link',
    socialButtonsBlockButton: 'clerk-social-btn',
  }
};

/* ── bootstrap ──────────────────────────────────────────── */
async function initAuth() {
  const pk = document.querySelector('meta[name="clerk-pk"]')?.content;

  if (!pk || pk.startsWith('YOUR_')) {
    /* No key configured — skip auth, run app normally */
    console.warn('[auth] No Clerk publishable key — running without auth.');
    hideAuthLoader();
    goStep(1);
    return;
  }

  try {
    clerk = new window.Clerk(pk);
    await clerk.load();
  } catch (e) {
    console.error('[auth] Clerk failed to load:', e);
    hideAuthLoader();
    goStep(1);
    return;
  }

  clerk.addListener(({ user }) => {
    if (user) onSignedIn();
    else      onSignedOut();
  });

  if (clerk.user) onSignedIn();
  else            onSignedOut();
}

/* ── signed-in ──────────────────────────────────────────── */
async function onSignedIn() {
  showPage('app');

  /* mount user button */
  const slot = document.getElementById('user-btn-slot');
  if (slot && !slot.hasChildNodes()) {
    clerk.mountUserButton(slot, {
      appearance: CLERK_APPEARANCE,
      userProfileProps: { appearance: CLERK_APPEARANCE }
    });
  }

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
    hideAuthLoader();
    console.error('[auth] profile load failed:', e);
    goStep(1);
  }
}

/* ── signed-out ─────────────────────────────────────────── */
function onSignedOut() {
  showPage('auth-page');
  const container = document.getElementById('clerk-sign-in');
  container.innerHTML = '';
  clerk.mountSignIn(container, { appearance: CLERK_APPEARANCE });
}

/* ── token helper (used by db.js) ───────────────────────── */
async function getAuthToken() {
  if (!clerk?.session) return null;
  return await clerk.session.getToken();
}

/* ── sign-out (called from header button if needed) ─────── */
async function doSignOut() {
  if (clerk) await clerk.signOut();
}

/* ── page visibility helpers ────────────────────────────── */
function showPage(id) {
  ['app', 'auth-page'].forEach(p => {
    const el = document.getElementById(p);
    if (el) el.style.display = p === id ? 'block' : 'none';
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
