/* ══════════════════════════════════════════════════════
   STEP 1 — BIO STATS
══════════════════════════════════════════════════════ */
function step1(ob) {
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">STEP 01 / 06</div>
    <div class="card-title">Bio Stats</div>
    <div class="card-sub">Tell me about your body — I'll do the math</div>
    <div class="field"><label>Age (years)</label>
      <input type="number" id="a-age" value="${S.age||''}" placeholder="25" min="10" max="100"></div>
    <div class="field"><label>Gender</label>
      <div class="opts g3" id="g-gender">
        <div class="opt${S.gender==='Male'?' selected':''}" data-v="Male"><div class="opt-icon">♂️</div><span class="opt-lbl">Male</span></div>
        <div class="opt${S.gender==='Female'?' selected':''}" data-v="Female"><div class="opt-icon">♀️</div><span class="opt-lbl">Female</span></div>
        <div class="opt${S.gender==='Other'?' selected':''}" data-v="Other"><div class="opt-icon">⚧️</div><span class="opt-lbl">Other</span></div>
      </div></div>
    <div class="field"><label>Height (cm)</label>
      <input type="number" id="a-ht" value="${S.height||''}" placeholder="170" min="100" max="250"></div>
    <div class="field"><label>Weight (kg)</label>
      <input type="number" id="a-wt" value="${S.weight||''}" placeholder="70" min="30" max="300"></div>
    <div class="field"><label>Activity Level</label>
      <div class="opts g5" id="g-act">
        <div class="opt${S.activity==='Sedentary'?' selected':''}" data-v="Sedentary" data-m="1.2"><div class="opt-icon">🛋️</div><span class="opt-lbl" style="font-size:9px">Sedentary</span><span class="opt-sub">desk job</span></div>
        <div class="opt${S.activity==='Light'?' selected':''}" data-v="Light" data-m="1.375"><div class="opt-icon">🚶</div><span class="opt-lbl" style="font-size:9px">Light</span><span class="opt-sub">1-3×/wk</span></div>
        <div class="opt${S.activity==='Moderate'?' selected':''}" data-v="Moderate" data-m="1.55"><div class="opt-icon">🏃</div><span class="opt-lbl" style="font-size:9px">Moderate</span><span class="opt-sub">3-5×/wk</span></div>
        <div class="opt${S.activity==='Active'?' selected':''}" data-v="Active" data-m="1.725"><div class="opt-icon">💪</div><span class="opt-lbl" style="font-size:9px">Active</span><span class="opt-sub">6-7×/wk</span></div>
        <div class="opt${S.activity==='Athlete'?' selected':''}" data-v="Athlete" data-m="1.9"><div class="opt-icon">🏋️</div><span class="opt-lbl" style="font-size:9px">Athlete</span><span class="opt-sub">2×/day</span></div>
      </div></div>
    <button class="btn" onclick="sub1()">Continue →</button>`;
  ob.appendChild(c);
  bindOpts(c.querySelector('#g-gender'));
  bindOpts(c.querySelector('#g-act'));
}
function sub1() {
  const age=+document.getElementById('a-age').value;
  const ht=+document.getElementById('a-ht').value;
  const wt=+document.getElementById('a-wt').value;
  const gOpt=document.querySelector('#g-gender .opt.selected');
  const aOpt=document.querySelector('#g-act .opt.selected');
  if(!age||!ht||!wt||!gOpt||!aOpt){showNotif('Please fill all fields','Missing Info');return;}
  S.age=age; S.height=ht; S.weight=wt;
  S.gender=gOpt.dataset.v; S.activity=aOpt.dataset.v; S.actMult=+aOpt.dataset.m;
  goStep(2);
}

/* ══════════════════════════════════════════════════════
   STEP 2 — GOAL
══════════════════════════════════════════════════════ */
function step2(ob) {
  const t = Math.round(tdee());
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">STEP 02 / 06</div>
    <div class="card-title">Your Goal</div>
    <div class="card-sub">Your TDEE: <span style="color:var(--accent);font-weight:700">${t} kcal/day</span></div>
    <div class="opts g2" id="g-goal">
      <div class="opt${S.goalLabel==='Aggressive Loss'?' selected':''}" data-v="-750" data-l="Aggressive Loss"><div class="opt-icon">🔥</div><span class="opt-lbl">Aggressive Loss</span><span class="opt-sub">−750 kcal/day</span></div>
      <div class="opt${S.goalLabel==='Steady Loss'?' selected':''}" data-v="-350" data-l="Steady Loss"><div class="opt-icon">📉</div><span class="opt-lbl">Steady Loss</span><span class="opt-sub">−350 kcal/day</span></div>
      <div class="opt${S.goalLabel==='Maintain'?' selected':''}" data-v="0" data-l="Maintain"><div class="opt-icon">⚖️</div><span class="opt-lbl">Maintain</span><span class="opt-sub">±0 kcal/day</span></div>
      <div class="opt${S.goalLabel==='Lean Bulk'?' selected':''}" data-v="250" data-l="Lean Bulk"><div class="opt-icon">📈</div><span class="opt-lbl">Lean Bulk</span><span class="opt-sub">+250 kcal/day</span></div>
      <div class="opt${S.goalLabel==='Heavy Bulk'?' selected':''}" data-v="500" data-l="Heavy Bulk" style="grid-column:span 2"><div class="opt-icon">💥</div><span class="opt-lbl">Heavy Bulk</span><span class="opt-sub">+500 kcal/day</span></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(1)">← Back</button>
      <button class="btn" onclick="sub2()">Continue →</button>
    </div>`;
  ob.appendChild(c);
  bindOpts(c.querySelector('#g-goal'));
}
function sub2() {
  const o=document.querySelector('#g-goal .opt.selected');
  if(!o){showNotif('Select a goal','Missing Info');return;}
  S.goal=+o.dataset.v; S.goalLabel=o.dataset.l; goStep(3);
}

/* ══════════════════════════════════════════════════════
   STEP 3 — WEIGHT TARGET
══════════════════════════════════════════════════════ */
function step3(ob) {
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">STEP 03 / 06</div>
    <div class="card-title">Weight Target</div>
    <div class="card-sub">Set your destination — I'll map the route</div>
    <div class="field"><label>Target Weight (kg)</label>
      <input type="number" id="a-tw" value="${S.targetWeight||''}" placeholder="${S.weight}" min="30" max="300" oninput="updTL()"></div>
    <div class="field">
      <div class="range-row"><span>Pace</span><span class="range-val" id="pv">${S.pace} kg/week</span></div>
      <input type="range" min=".25" max="1" step=".25" value="${S.pace}"
        oninput="document.getElementById('pv').textContent=this.value+' kg/week';S.pace=+this.value;updTL()">
      <div class="range-hints"><span>.25 kg/wk</span><span>1.0 kg/wk</span></div>
    </div>
    <div class="tl-preview" id="tl">
      <div class="tl-row"><span class="tl-lbl">Current</span><span class="tl-val">${S.weight} kg</span></div>
      <div class="tl-row"><span class="tl-lbl">Target</span><span class="tl-val" id="tl-t">— kg</span></div>
      <div class="tl-row"><span class="tl-lbl">Duration</span><span class="tl-val" id="tl-w">—</span></div>
      <div class="tl-row"><span class="tl-lbl">Est. End Date</span><span class="tl-val" id="tl-d">—</span></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(2)">← Back</button>
      <button class="btn" onclick="sub3()">Continue →</button>
    </div>`;
  ob.appendChild(c);
  if(S.targetWeight) updTL();
}
function updTL() {
  const t=+document.getElementById('a-tw').value;
  if(!t) return;
  S.targetWeight=t;
  const tl=timeline();
  document.getElementById('tl-t').textContent=t+' kg';
  document.getElementById('tl-w').textContent=`${tl.weeks} weeks (${tl.months} months)`;
  document.getElementById('tl-d').textContent=tl.end.toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'});
}
function sub3() {
  if(!S.targetWeight||S.targetWeight<=0){showNotif('Enter a valid target weight','Missing Info');return;}
  goStep(4);
}

/* ══════════════════════════════════════════════════════
   STEP 4 — DIET & PANTRY
══════════════════════════════════════════════════════ */
function step4(ob) {
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">STEP 04 / 06</div>
    <div class="card-title">Diet & Pantry</div>
    <div class="card-sub">What you eat — and what you have to cook with</div>
    <div class="field"><label>Diet Preference</label>
      <div class="opts g3" id="g-diet">
        <div class="opt${S.diet==='Vegan'?' selected':''}" data-v="Vegan"><div class="opt-icon">🌱</div><span class="opt-lbl">Vegan</span></div>
        <div class="opt${S.diet==='Vegetarian'?' selected':''}" data-v="Vegetarian"><div class="opt-icon">🥗</div><span class="opt-lbl">Vegetarian</span></div>
        <div class="opt${S.diet==='Non-Veg'?' selected':''}" data-v="Non-Veg"><div class="opt-icon">🍗</div><span class="opt-lbl">Non-Veg</span></div>
      </div></div>
    <div class="field"><label>Pantry (type + Enter, max 5)</label>
      <div class="chip-wrap" id="chips">
        <input type="text" class="chip-inp" id="ci" placeholder="e.g. chicken, paneer, oats…" onkeydown="addChip(event)">
      </div>
      <div id="chip-count" style="font-size:10px;color:var(--muted)">${S.pantry.length}/5 ingredients</div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(3)">← Back</button>
      <button class="btn" onclick="sub4()">Continue →</button>
    </div>`;
  ob.appendChild(c);
  bindOpts(c.querySelector('#g-diet'));
  renderChips();
}
function addChip(e) {
  if(e.key!=='Enter') return; e.preventDefault();
  const inp=document.getElementById('ci');
  const v=inp.value.trim();
  if(!v||S.pantry.length>=5||S.pantry.includes(v)) return;
  S.pantry.push(v); inp.value=''; renderChips();
}
function rmChip(v) {
  S.pantry=S.pantry.filter(p=>p!==v); renderChips();
}
function renderChips() {
  const wrap=document.getElementById('chips');
  const inp=document.getElementById('ci');
  if(!wrap||!inp) return;
  wrap.querySelectorAll('.chip').forEach(c=>c.remove());
  S.pantry.forEach(p=>{
    const chip=document.createElement('div');
    chip.className='chip';
    chip.innerHTML=`${p}<span class="x" onclick="rmChip('${p}')">✕</span>`;
    wrap.insertBefore(chip, inp);
  });
  const cc=document.getElementById('chip-count');
  if(cc) cc.textContent=`${S.pantry.length}/5 ingredients`;
}
function sub4() {
  const o=document.querySelector('#g-diet .opt.selected');
  if(!o){showNotif('Select a diet preference','Missing Info');return;}
  S.diet=o.dataset.v; goStep(5);
}

/* ══════════════════════════════════════════════════════
   STEP 5 — REMINDERS
══════════════════════════════════════════════════════ */
function step5(ob) {
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">STEP 05 / 06</div>
    <div class="card-title">Reminders</div>
    <div class="card-sub">I'll keep you on schedule, every single day</div>
    <div class="field"><label>Breakfast Time</label><input type="time" id="r-bf" value="${S.reminders.breakfast}"></div>
    <div class="field"><label>Lunch Time</label><input type="time" id="r-ln" value="${S.reminders.lunch}"></div>
    <div class="field"><label>Dinner Time</label><input type="time" id="r-dn" value="${S.reminders.dinner}"></div>
    <div class="field"><label>Workout Time</label><input type="time" id="r-wo" value="${S.reminders.workout}"></div>
    <div class="field">
      <div class="range-row"><span>Workout Days / Week</span><span class="range-val" id="wdv">${S.reminders.workoutDays} days</span></div>
      <input type="range" min="1" max="7" step="1" value="${S.reminders.workoutDays}"
        oninput="document.getElementById('wdv').textContent=this.value+' days';S.reminders.workoutDays=+this.value">
      <div class="range-hints"><span>1 day</span><span>7 days</span></div>
    </div>
    <div class="field">
      <div class="range-row"><span>Water Reminder Interval</span><span class="range-val" id="wiv">${S.reminders.waterInterval} min</span></div>
      <input type="range" min="30" max="180" step="15" value="${S.reminders.waterInterval}"
        oninput="document.getElementById('wiv').textContent=this.value+' min';S.reminders.waterInterval=+this.value">
      <div class="range-hints"><span>30 min</span><span>3 hours</span></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(4)">← Back</button>
      <button class="btn" onclick="sub5()">Continue →</button>
    </div>`;
  ob.appendChild(c);
}
function sub5() {
  S.reminders.breakfast=document.getElementById('r-bf').value;
  S.reminders.lunch=document.getElementById('r-ln').value;
  S.reminders.dinner=document.getElementById('r-dn').value;
  S.reminders.workout=document.getElementById('r-wo').value;
  goStep(6);
}

/* ══════════════════════════════════════════════════════
   STEP 6 — LAUNCH
══════════════════════════════════════════════════════ */
function step6(ob) {
  const b=bmi().toFixed(1), bc=bmiCat(+b);
  const d=Math.round(daily()), br=Math.round(bmr()), td=Math.round(tdee());
  const tl=timeline();
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">STEP 06 / 06</div>
    <div class="card-title">Ready for Launch 🚀</div>
    <div class="card-sub">Your personalized engine is calibrated</div>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-lbl">BMI</div><div class="stat-val" style="color:${bc.color}">${b}</div><div class="stat-unit">${bc.label}</div></div>
      <div class="stat-box"><div class="stat-lbl">Daily Target</div><div class="stat-val">${d}</div><div class="stat-unit">kcal/day</div></div>
      <div class="stat-box"><div class="stat-lbl">BMR</div><div class="stat-val" style="font-size:20px">${br}</div><div class="stat-unit">kcal/day</div></div>
      <div class="stat-box"><div class="stat-lbl">TDEE</div><div class="stat-val" style="font-size:20px">${td}</div><div class="stat-unit">kcal/day</div></div>
    </div>
    <div style="background:rgba(0,229,192,.05);border:1px solid rgba(0,229,192,.12);border-radius:10px;padding:13px;margin-bottom:16px">
      <div style="font-size:10px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">Profile Summary</div>
      <div style="font-size:11px;line-height:2.1;color:var(--text)">
        <span>👤 ${S.age}yo ${S.gender}, ${S.height}cm, ${S.weight}kg</span><br>
        <span>🏃 Activity: ${S.activity} (×${S.actMult})</span><br>
        <span>🎯 Goal: ${S.goalLabel}</span><br>
        <span>🥗 Diet: ${S.diet}${S.pantry.length?` · ${S.pantry.join(', ')}`:''}</span><br>
        <span>📍 Target: ${S.targetWeight}kg @ ${S.pace}kg/wk · ${tl.weeks} weeks</span>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(5)">← Back</button>
      <button class="btn" onclick="launch()">Launch Dashboard 🚀</button>
    </div>`;
  ob.appendChild(c);
}
async function launch() {
  document.getElementById('onboarding').style.display='none';
  renderDots(STEPS+1);
  document.getElementById('dashboard').style.display='block';
  buildDashboard();
  await saveProfile();          /* persist onboarding data for next visit */
  showNotif('Dashboard loaded — all systems go.','दर्जी Ready 🚀');
}
