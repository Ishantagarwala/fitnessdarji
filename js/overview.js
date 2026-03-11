/* ══════════════════════════════════════════════════════
   TAB 1 — OVERVIEW
══════════════════════════════════════════════════════ */
function tabOverview() {
  const p = document.getElementById('p-overview');
  const b=bmi(), bc=bmiCat(b);
  const d=Math.round(daily()), br=Math.round(bmr()), td=Math.round(tdee());
  const m=macros();
  const pPct=Math.round(m.protein*4/d*100);
  const cPct=Math.round(m.carbs*4/d*100);
  const fPct=Math.round(m.fat*9/d*100);

  p.innerHTML=`
    <div class="gauge-wrap">${buildGauge(b)}</div>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-lbl">BMI</div><div class="stat-val" style="color:${bc.color}">${b.toFixed(1)}</div><div class="stat-unit">${bc.label}</div></div>
      <div class="stat-box"><div class="stat-lbl">Daily Target</div><div class="stat-val">${d}</div><div class="stat-unit">kcal/day</div></div>
      <div class="stat-box"><div class="stat-lbl">BMR</div><div class="stat-val" style="font-size:20px">${br}</div><div class="stat-unit">kcal/day</div></div>
      <div class="stat-box"><div class="stat-lbl">TDEE</div><div class="stat-val" style="font-size:20px">${td}</div><div class="stat-unit">kcal/day</div></div>
    </div>
    <div class="card" style="margin:0 0 14px">
      <div class="sec-hdr"><div class="sec-title">Macros</div><div class="sec-sub">${d} kcal / day</div></div>
      <div class="macro-block">
        <div class="macro-hdr"><span class="macro-name">Protein</span><span class="macro-info">${m.protein}g &nbsp;<span style="color:var(--accent)">${pPct}%</span></span></div>
        <div class="macro-track"><div class="macro-fill" id="bp" style="background:var(--accent)"></div></div>
      </div>
      <div class="macro-block">
        <div class="macro-hdr"><span class="macro-name">Carbohydrates</span><span class="macro-info">${m.carbs}g &nbsp;<span style="color:var(--accent4)">${cPct}%</span></span></div>
        <div class="macro-track"><div class="macro-fill" id="bc" style="background:var(--accent4)"></div></div>
      </div>
      <div class="macro-block">
        <div class="macro-hdr"><span class="macro-name">Fat</span><span class="macro-info">${m.fat}g &nbsp;<span style="color:var(--accent2)">${fPct}%</span></span></div>
        <div class="macro-track"><div class="macro-fill" id="bf" style="background:var(--accent2)"></div></div>
      </div>
    </div>`;

  setTimeout(()=>{
    const el=e=>document.getElementById(e);
    if(el('bp')) el('bp').style.width=pPct+'%';
    if(el('bc')) el('bc').style.width=cPct+'%';
    if(el('bf')) el('bf').style.width=fPct+'%';
    animNeedle(b);
  },120);
}

function buildGauge(b) {
  const W=220,H=148,cx=110,cy=120,r=92;
  const bMin=10,bMax=40;
  const ang = a => a*Math.PI/180;

  /* Convert zone angle (0=left, 180=right) to SVG point on the arc */
  function pt(a) {
    const rad = ang(180 - a);   // map so a=0→left, a=180→right
    return { x: cx + r*Math.cos(rad), y: cy - r*Math.sin(rad) };
  }

  function arc(a1, a2, col) {
    const p1=pt(a1), p2=pt(a2);
    const lg=(a2-a1)>180?1:0;
    /* sweep=1 = clockwise in SVG (draws the upper / visible semicircle) */
    return `<path d="M${p1.x.toFixed(2)},${p1.y.toFixed(2)} A${r},${r} 0 ${lg} 1 ${p2.x.toFixed(2)},${p2.y.toFixed(2)}" stroke="${col}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
  }

  function b2a(bv){return((bv-bMin)/(bMax-bMin))*180}

  const zones=[
    {a1:0,          a2:b2a(18.5), c:'#3b82f6'},
    {a1:b2a(18.5),  a2:b2a(25),   c:'#00e5c0'},
    {a1:b2a(25),    a2:b2a(30),   c:'#ffc107'},
    {a1:b2a(30),    a2:180,       c:'#ff4d6d'},
  ];
  const arcs=zones.map(z=>arc(z.a1,z.a2,z.c)).join('');
  const bc=bmiCat(b);
  const L=pt(0), R=pt(180);

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <path d="M${L.x.toFixed(1)},${L.y.toFixed(1)} A${r},${r} 0 0 1 ${R.x.toFixed(1)},${R.y.toFixed(1)}" stroke="rgba(30,45,56,.6)" stroke-width="13" fill="none"/>
    ${arcs}
    <line id="bmi-needle" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-r+16}"
      stroke="rgba(232,244,240,.9)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="5" fill="var(--text)" opacity=".9"/>
    <text x="${cx}" y="${cy-26}" text-anchor="middle" fill="${bc.color}" font-size="30" font-weight="800" font-family="Syne">${b.toFixed(1)}</text>
    <text x="${cx}" y="${cy-8}" text-anchor="middle" fill="#5a7a8a" font-size="10" font-family="Space Mono">${bc.label}</text>
    <text x="${L.x-4}" y="${cy+16}" fill="#3b82f6" font-size="9" text-anchor="end" font-family="Space Mono">10</text>
    <text x="${R.x+4}" y="${cy+16}" fill="#ff4d6d" font-size="9" text-anchor="start" font-family="Space Mono">40</text>
  </svg>`;
}

function animNeedle(b) {
  const bMin=10,bMax=40;
  const cl=Math.min(Math.max(b,bMin),bMax);
  const angDeg=180-((cl-bMin)/(bMax-bMin))*180;
  const needle=document.getElementById('bmi-needle');
  if(!needle) return;
  needle.style.transformOrigin='110px 120px';
  needle.style.transform='rotate(-90deg)';
  needle.style.transition='transform 1.6s cubic-bezier(.34,1.56,.64,1)';
  setTimeout(()=>{ needle.style.transform=`rotate(${90-angDeg}deg)`; },250);
}
