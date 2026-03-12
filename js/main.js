/* ══════════════════════════════════════════════════════
   INIT — entry point
══════════════════════════════════════════════════════ */
checkProtocol();
initAuth();       /* auth.js — handles Clerk init, then goStep(1) or dashboard */
