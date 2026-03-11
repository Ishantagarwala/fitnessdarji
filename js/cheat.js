/* ══════════════════════════════════════════════════════
   TAB 8 — CHEAT MEAL
══════════════════════════════════════════════════════ */
function tabCheat() {
  const p=document.getElementById('p-cheat');
  if(p.dataset.built) return;
  p.dataset.built='1';
  p.innerHTML=`
    <div class="sec-hdr"><div class="sec-title">Cheat Meal Planner</div></div>
    <div class="card" style="margin:0 0 13px;text-align:center">
      <div style="font-size:36px;margin-bottom:10px">🍕</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:13px;line-height:1.7">
        You've been working hard. Let's plan a <strong style="color:var(--accent)">strategic</strong> cheat meal<br>
        that satisfies without derailing your <strong style="color:var(--text)">${S.goalLabel}</strong> progress.
      </div>
      <button class="btn" onclick="genCheat()">Plan My Cheat Meal 🎉</button>
    </div>
    <div id="cheat-out"></div>`;
}

async function genCheat() {
  const prompt=`You are a nutrition coach who believes in sustainable dieting. Plan a strategic cheat meal.
User: ${S.age}yo, ${S.weight}kg, Goal: ${S.goalLabel}, Diet: ${S.diet}, Daily target: ${Math.round(daily())} kcal
Return ONLY valid JSON:
{"cheat_score":82,"occasion":"Saturday evening reward",
"meals":[{"name":"Margherita Pizza (2 slices)","calories":520,"why_ok":"Moderate load, satisfies craving","indulgence":70},{"name":"Dark Chocolate (40g)","calories":220,"why_ok":"Antioxidants, portion controlled","indulgence":60}],
"rules":["Eat mindfully — savor every bite","Don't exceed 800 extra kcal above TDEE","Resume normal eating at next meal"],
"recovery_tips":["Add 20 min cardio next session","Drink 3L water next day","Don't skip protein tomorrow"]}`;

  const out=document.getElementById('cheat-out');
  out.innerHTML=`<div class="loader"><div class="spinner"></div><div class="loader-txt">PLANNING YOUR CHEAT MEAL...</div></div>`;
  try {
    const raw=await callAPI(prompt);
    const data=parseObj(raw);
    const meals=data.meals.map(m=>`
      <div class="cheat-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7px">
          <div style="font-family:var(--display);font-size:14px;font-weight:700">${m.name}</div>
          <span class="badge b-cal">🔥 ${m.calories} kcal</span>
        </div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:7px">${m.why_ok}</div>
        <div style="font-size:10px;color:var(--muted);margin-bottom:4px">Indulgence: ${m.indulgence}%</div>
        <div class="indulge-track"><div class="indulge-fill" style="width:${m.indulgence}%"></div></div>
      </div>`).join('');
    out.innerHTML=`
      <div class="res-card" style="text-align:center">
        <div class="res-title">Cheat Strategy</div>
        <div class="rings-row" style="justify-content:center">${buildRings([{score:data.cheat_score||80,label:'Satisfaction',color:'#ffc107'}])}</div>
        <div style="font-size:13px;color:var(--accent3);font-weight:600;margin-top:4px">${data.occasion}</div>
      </div>
      ${meals}
      ${data.rules?`<div class="proto-card"><div class="proto-title">📋 Cheat Meal Rules</div>${data.rules.map(r=>`<div class="proto-rule">${r}</div>`).join('')}</div>`:''}
      ${data.recovery_tips?`<div class="proto-card" style="border-color:rgba(0,229,192,.2)"><div class="proto-title" style="color:var(--accent)">⚡ Recovery Plan</div>${data.recovery_tips.map(r=>`<div class="proto-rule">${r}</div>`).join('')}</div>`:''}`;
  } catch(e) {
    out.innerHTML=`<div class="err-card"><p>⚠️ Could not plan cheat meal. Check your OpenAI API key in the header.<br><br><small>${e.message}</small></p><button class="btn btn-red btn-sm" onclick="genCheat()">Retry</button></div>`;
  }
}
