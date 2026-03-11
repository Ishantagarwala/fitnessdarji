/* ══════════════════════════════════════════════════════
   TOASTS
══════════════════════════════════════════════════════ */
function showNotif(msg, title='') {
  const c = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = title ? `<strong>${title}</strong><br>${msg}` : msg;
  c.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(110%)'; t.style.transition='all .3s'; setTimeout(()=>t.remove(),320); }, 3500);
}

function fireN(title, body) {
  if(Notification.permission==='granted') new Notification(title,{body,icon:'💪'});
  showNotif(body, title);
}

/* ══════════════════════════════════════════════════════
   PROGRESS DOTS
══════════════════════════════════════════════════════ */
function renderDots(cur) {
  const c = document.getElementById('dots');
  c.style.display = cur > STEPS ? 'none' : 'flex';
  c.innerHTML = '';
  for(let i=1;i<=STEPS;i++){
    const d=document.createElement('div');
    d.className='dot'+(i<cur?' done':i===cur?' active':'');
    c.appendChild(d);
  }
}

/* ══════════════════════════════════════════════════════
   OPT SELECT HELPER
══════════════════════════════════════════════════════ */
function bindOpts(wrap) {
  wrap.querySelectorAll('.opt').forEach(o=>{
    o.addEventListener('click',()=>{
      wrap.querySelectorAll('.opt').forEach(x=>x.classList.remove('selected'));
      o.classList.add('selected');
    });
  });
}

/* ══════════════════════════════════════════════════════
   ONBOARDING ROUTER
══════════════════════════════════════════════════════ */
function goStep(n) {
  step = n;
  renderDots(n);
  const ob = document.getElementById('onboarding');
  ob.innerHTML='';
  if(n===1) step1(ob);
  else if(n===2) step2(ob);
  else if(n===3) step3(ob);
  else if(n===4) step4(ob);
  else if(n===5) step5(ob);
  else if(n===6) step6(ob);
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ══════════════════════════════════════════════════════
   SCORE RING BUILDER
══════════════════════════════════════════════════════ */
function buildRings(items) {
  return items.map(({score,label,color})=>{
    const r=30, circ=2*Math.PI*r;
    const offset=circ*(1-score/100);
    return `<div class="ring-item">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="${r}" fill="none" stroke="rgba(30,45,56,.8)" stroke-width="6"/>
        <circle cx="40" cy="40" r="${r}" fill="none" stroke="${color}" stroke-width="6"
          stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
          stroke-linecap="round" transform="rotate(-90 40 40)"/>
        <text x="40" y="45" text-anchor="middle" fill="${color}" font-size="15" font-weight="800" font-family="Syne">${score}</text>
      </svg>
      <div class="ring-lbl" style="color:${color}">${label}</div>
    </div>`;
  }).join('');
}

function animBars(cls) {
  document.querySelectorAll('.'+cls).forEach(el=>{
    const w=el.dataset.w||el.getAttribute('data-w');
    if(w) el.style.width=w+'%';
  });
}

/* ══════════════════════════════════════════════════════
   CORS / PROTOCOL CHECK
══════════════════════════════════════════════════════ */
function checkProtocol() {
  if (window.location.protocol === 'file:') {
    document.getElementById('cors-banner').style.display = 'flex';
  }
}

function copyCmd(el) {
  const cmd = el.dataset.cmd;
  navigator.clipboard.writeText(cmd).then(() => {
    const label = el.querySelector('.cors-copy');
    label.textContent = 'copied!';
    label.style.color = 'var(--accent)';
    setTimeout(() => { label.textContent = 'copy'; label.style.color = ''; }, 2000);
  }).catch(() => {
    /* fallback — select the text */
    const range = document.createRange();
    range.selectNode(el.querySelector('code'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
}
