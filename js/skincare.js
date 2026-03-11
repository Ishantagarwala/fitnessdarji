/* ══════════════════════════════════════════════════════
   TAB 6 — SKIN CARE
══════════════════════════════════════════════════════ */
function tabSkinCare() {
  const p=document.getElementById('p-skincare');
  if(p.dataset.built) return;
  p.dataset.built='1';
  p.innerHTML=`
    <div class="sec-hdr"><div class="sec-title">Skin Analysis</div></div>
    <div class="drop-zone" id="skin-dz"
         onclick="document.getElementById('skin-fi').click()"
         ondragover="event.preventDefault();this.classList.add('over')"
         ondragleave="this.classList.remove('over')"
         ondrop="dropSkin(event)">
      <div class="drop-icon">🤳</div>
      <div class="drop-txt">Upload a selfie for AI skin analysis</div>
      <div style="font-size:10px;color:var(--muted)">Good lighting gives better results</div>
    </div>
    <input type="file" id="skin-fi" accept="image/*" style="display:none" onchange="fileSkin(this)">
    <img id="skin-prev" class="scan-preview">
    <div class="cam-ctrls">
      <button class="btn btn-ghost btn-sm" id="skin-cam" onclick="openCam('skin')">🤳 Front Camera</button>
      <button class="btn btn-ghost btn-sm" id="skin-cap" style="display:none" onclick="capCam('skin')">⚡ Capture</button>
      <button class="btn btn-ghost btn-sm" id="skin-cls" style="display:none" onclick="closeCam('skin')">✕ Close</button>
    </div>
    <video id="skin-vid" class="scan-vid" autoplay playsinline></video>
    <button class="btn btn-purple" id="skin-anlz" style="display:none" onclick="analyzeSkin()">✨ Analyze My Skin</button>
    <div id="skin-out"></div>`;
}

function dropSkin(e) {
  e.preventDefault();
  document.getElementById('skin-dz').classList.remove('over');
  readFile(e.dataTransfer.files[0],'skin');
}
function fileSkin(inp){ readFile(inp.files[0],'skin'); }

async function analyzeSkin() {
  if(!skinB64){showNotif('Upload or capture a selfie first');return;}
  const prompt=`Analyze this facial/skin photo and give a comprehensive skincare assessment.
User: ${S.age}yo ${S.gender}, Diet: ${S.diet}
Return ONLY valid JSON:
{"skin_type":"Combination","skin_score":72,"hydration_level":"Moderate",
"concerns":[{"name":"T-zone oiliness","severity":"moderate","color":"#ffc107"}],
"positives":["Even skin tone","Good elasticity"],
"morning_routine":[{"step":1,"name":"Gentle Cleanser","description":"Wash with lukewarm water 60s","product_type":"Foaming gel cleanser","key_ingredients":["Salicylic Acid","Niacinamide"]}],
"evening_routine":[{"step":1,"name":"Double Cleanse","description":"Oil cleanser then water-based","product_type":"Oil + Gel cleanser","key_ingredients":["Jojoba Oil","Ceramides"]}],
"weekly_treatments":["Clay mask 1-2×/week","Chemical exfoliant 1×/week"],
"diet_tips":["Reduce refined sugar","Increase omega-3","Drink 2L+ water daily"],
"avoid":["Harsh physical scrubs","Alcohol-based toners"],
"pro_tip":"Apply SPF 30+ every morning — it's the #1 anti-aging step"}`;

  const out=document.getElementById('skin-out');
  out.innerHTML=`<div class="loader"><div class="spinner"></div><div class="loader-txt">ANALYZING YOUR SKIN...</div></div>`;
  try {
    const raw=await callVisionAPI(prompt,skinB64);
    const data=parseObj(raw);
    out.innerHTML=renderSkinResults(data);
  } catch(e) {
    out.innerHTML=`<div class="err-card"><p>⚠️ Skin analysis failed. Check your OpenAI API key in the header.<br><br><small>${e.message}</small></p><button class="btn btn-red btn-sm" onclick="analyzeSkin()">Retry</button></div>`;
  }
}

function renderSkinResults(d) {
  const rings=buildRings([{score:d.skin_score||0,label:'Skin Score',color:'#a78bfa'}]);
  const concerns=(d.concerns||[]).map(c=>`
    <span class="concern-tag" style="background:${c.color}22;border:1px solid ${c.color}44;color:${c.color}">
      ${c.name} · ${c.severity}
    </span>`).join('');
  const pos=(d.positives||[]).map(p=>`<span class="strength-tag">✓ ${p}</span>`).join('');

  function rRoutine(steps){
    return (steps||[]).map(s=>`
      <div class="routine-step">
        <div class="step-num-circle">${s.step}</div>
        <div>
          <div class="step-name">${s.name}</div>
          <div class="step-desc">${s.description}</div>
          <div class="step-pt">${s.product_type}</div>
          <div class="ing-tags">${(s.key_ingredients||[]).map(i=>`<span class="ing-tag">${i}</span>`).join('')}</div>
        </div>
      </div>`).join('');
  }

  return `
    <div class="res-card">
      <div class="res-title">Skin Assessment</div>
      <div class="rings-row">${rings}</div>
      <div class="stats-grid">
        <div class="stat-box"><div class="stat-lbl">Skin Type</div><div style="font-family:var(--display);font-size:15px;font-weight:700;color:var(--accent)">${d.skin_type||'—'}</div></div>
        <div class="stat-box"><div class="stat-lbl">Hydration</div><div style="font-family:var(--display);font-size:15px;font-weight:700;color:var(--accent4)">${d.hydration_level||'—'}</div></div>
      </div>
      ${concerns?`<div class="scan-sec-title" style="margin-top:4px">Concerns</div><div style="margin-bottom:10px">${concerns}</div>`:''}
      ${pos?`<div class="scan-sec-title">Positives</div><div class="tag-list" style="margin-bottom:6px">${pos}</div>`:''}
    </div>
    ${d.morning_routine&&d.morning_routine.length?`<div class="res-card"><div class="res-title">☀️ Morning Routine</div>${rRoutine(d.morning_routine)}</div>`:''}
    ${d.evening_routine&&d.evening_routine.length?`<div class="res-card"><div class="res-title">🌙 Evening Routine</div>${rRoutine(d.evening_routine)}</div>`:''}
    ${d.weekly_treatments&&d.weekly_treatments.length?`<div class="res-card"><div class="res-title">📅 Weekly Treatments</div>${d.weekly_treatments.map(t=>`<div class="proto-rule">${t}</div>`).join('')}</div>`:''}
    ${d.diet_tips&&d.diet_tips.length?`<div class="res-card"><div class="res-title">🥗 Diet for Skin</div>${d.diet_tips.map(t=>`<div class="proto-rule">${t}</div>`).join('')}</div>`:''}
    ${d.avoid&&d.avoid.length?`<div class="res-card" style="border-color:rgba(255,77,109,.2)"><div class="res-title" style="color:var(--accent2)">⛔ Avoid</div>${d.avoid.map(a=>`<div class="proto-rule" style="color:var(--accent2)">✕ ${a}</div>`).join('')}</div>`:''}
    ${d.pro_tip?`<div class="pro-tip">${d.pro_tip}</div>`:''}`;
}
