/* ══════════════════════════════════════════════════════
   TAB 5 — BODY SCAN
══════════════════════════════════════════════════════ */
function tabBodyScan() {
  const p=document.getElementById('p-bodyscan');
  if(p.dataset.built) return;
  p.dataset.built='1';
  p.innerHTML=`
    <div class="sec-hdr"><div class="sec-title">Body Scan Analysis</div></div>
    <div class="drop-zone" id="body-dz"
         onclick="document.getElementById('body-fi').click()"
         ondragover="event.preventDefault();this.classList.add('over')"
         ondragleave="this.classList.remove('over')"
         ondrop="dropBody(event)">
      <div class="drop-icon">📸</div>
      <div class="drop-txt">Drop a full-body photo or click to upload</div>
      <div style="font-size:10px;color:var(--muted)">JPG · PNG · WEBP supported</div>
    </div>
    <input type="file" id="body-fi" accept="image/*" style="display:none" onchange="fileBody(this)">
    <img id="body-prev" class="scan-preview">
    <div class="cam-ctrls">
      <button class="btn btn-ghost btn-sm" id="body-cam" onclick="openCam('body')">📷 Camera</button>
      <button class="btn btn-ghost btn-sm" id="body-cap" style="display:none" onclick="capCam('body')">⚡ Capture</button>
      <button class="btn btn-ghost btn-sm" id="body-cls" style="display:none" onclick="closeCam('body')">✕ Close</button>
    </div>
    <video id="body-vid" class="scan-vid" autoplay playsinline></video>
    <button class="btn btn-purple" id="body-anlz" style="display:none" onclick="analyzeBody()">🔬 Analyze My Body</button>
    <div id="body-out"></div>`;
}

function dropBody(e) {
  e.preventDefault();
  document.getElementById('body-dz').classList.remove('over');
  readFile(e.dataTransfer.files[0],'body');
}
function fileBody(inp){ readFile(inp.files[0],'body'); }

async function analyzeBody() {
  if(!bodyB64){showNotif('Upload or capture a photo first');return;}
  const prompt=`Analyze this full-body photo for fitness and body composition.
User: ${S.age}yo ${S.gender}, ${S.weight}kg, ${S.height}cm, Goal: ${S.goalLabel}
Return ONLY valid JSON (no other text):
{"overall_score":72,"posture_score":68,"body_type":"Mesomorph","estimated_body_fat":"18-22%",
"muscle_groups":[{"name":"Chest","score":65,"status":"Developing","color":"#00e5c0"},{"name":"Back","score":70,"status":"Good","color":"#a78bfa"},{"name":"Shoulders","score":60,"status":"Needs Work","color":"#ffc107"},{"name":"Arms","score":75,"status":"Good","color":"#00e5c0"},{"name":"Core","score":55,"status":"Weak","color":"#ff4d6d"},{"name":"Legs","score":68,"status":"Developing","color":"#a78bfa"}],
"weak_areas":[{"muscle":"Core","issue":"Visible anterior pelvic tilt","fix":"Add planks and dead bugs","priority":"high"}],
"strengths":["Good upper body development"],
"posture_issues":["Forward head posture"],
"weekly_focus":"Focus on core stability this week",
"pro_tip":"Add face pulls to correct shoulder imbalance"}`;

  const out=document.getElementById('body-out');
  out.innerHTML=`<div class="loader"><div class="spinner"></div><div class="loader-txt">SCANNING YOUR BODY...</div></div>`;
  try {
    const raw=await callVisionAPI(prompt,bodyB64);
    const data=parseObj(raw);
    out.innerHTML=renderBodyResults(data);
    setTimeout(()=>animBars('m-fill'),120);
  } catch(e) {
    out.innerHTML=`<div class="err-card"><p>⚠️ Body scan failed. GPT-4o and GPT-4o-mini support vision — check your API key.<br><br><small>${e.message}</small></p><button class="btn btn-red btn-sm" onclick="analyzeBody()">Retry</button></div>`;
  }
}

function renderBodyResults(d) {
  const rings=buildRings([
    {score:d.overall_score||0,label:'Overall',color:'#00e5c0'},
    {score:d.posture_score||0,label:'Posture',color:'#a78bfa'}
  ]);
  const muscles=(d.muscle_groups||[]).map(m=>`
    <div class="muscle-bar">
      <div class="muscle-hdr">
        <span class="m-name">${m.name}</span>
        <span class="m-score" style="color:${m.color}">${m.score}/100 · ${m.status}</span>
      </div>
      <div class="m-track"><div class="m-fill" style="background:${m.color}" data-w="${m.score}"></div></div>
    </div>`).join('');
  const weaks=(d.weak_areas||[]).map(w=>`
    <div class="weak-card">
      <div class="weak-hdr"><span class="weak-m">${w.muscle}</span><span class="pri pri-${w.priority||'m'}">${w.priority}</span></div>
      <div style="font-size:11px;color:var(--accent2);margin-bottom:6px">Issue: ${w.issue}</div>
      <div style="font-size:11px;color:var(--accent);border-left:2px solid var(--accent);padding-left:8px">Fix: ${w.fix}</div>
    </div>`).join('');
  const strengths=(d.strengths||[]).map(s=>`<span class="strength-tag">✓ ${s}</span>`).join('');
  const postures=(d.posture_issues||[]).map(p=>`<span class="concern-tag" style="background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.2);color:var(--accent2)">⚠ ${p}</span>`).join('');

  return `
    <div class="res-card">
      <div class="res-title">Body Composition</div>
      <div class="rings-row">${rings}</div>
      <div class="stats-grid">
        <div class="stat-box"><div class="stat-lbl">Body Type</div><div style="font-family:var(--display);font-size:15px;font-weight:700;color:var(--accent)">${d.body_type||'—'}</div></div>
        <div class="stat-box"><div class="stat-lbl">Est. Body Fat</div><div style="font-family:var(--display);font-size:15px;font-weight:700;color:var(--accent3)">${d.estimated_body_fat||'—'}</div></div>
      </div>
    </div>
    <div class="res-card"><div class="res-title">Muscle Group Analysis</div>${muscles}</div>
    ${weaks?`<div class="scan-sec"><div class="scan-sec-title">Areas to Focus On</div>${weaks}</div>`:''}
    ${strengths?`<div class="scan-sec"><div class="scan-sec-title">Strengths</div><div class="tag-list">${strengths}</div></div>`:''}
    ${postures?`<div class="scan-sec"><div class="scan-sec-title">Posture Issues</div>${postures}</div>`:''}
    ${d.weekly_focus?`<div class="weekly-focus">🎯 ${d.weekly_focus}</div>`:''}
    ${d.pro_tip?`<div class="pro-tip">${d.pro_tip}</div>`:''}`;
}
