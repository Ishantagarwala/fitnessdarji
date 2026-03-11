/* ══════════════════════════════════════════════════════
   TAB 3 — MEALS
══════════════════════════════════════════════════════ */
function tabMeals() {
  const p=document.getElementById('p-meals');
  if(p.dataset.built) return;
  p.dataset.built='1';
  const d=Math.round(daily()), m=macros();
  p.innerHTML=`
    <div class="sec-hdr"><div class="sec-title">Meal Plan</div></div>
    <div class="card" style="margin:0 0 13px;text-align:center">
      <div style="font-size:11px;color:var(--muted);margin-bottom:12px;line-height:1.7">
        Personalized for your <strong style="color:var(--text)">${S.diet} diet</strong><br>
        <strong style="color:var(--accent)">${d} kcal/day</strong> · P:${m.protein}g C:${m.carbs}g F:${m.fat}g<br>
        ${S.pantry.length?`<span style="color:var(--accent4)">Using: ${S.pantry.join(', ')}</span>`:'No pantry preferences'}
      </div>
      <button class="btn" onclick="genMeals()">Generate My Meal Plan</button>
    </div>
    <div id="meals-out"></div>`;
}

async function genMeals() {
  const d=Math.round(daily()), m=macros();
  const pantryStr=S.pantry.length?`Available pantry items: ${S.pantry.join(', ')}.`:'';
  const prompt=`You are a professional nutritionist. Create a personalized daily meal plan.
User: ${S.age}yo ${S.gender}, ${S.weight}kg, ${S.height}cm, Goal: ${S.goalLabel}, Diet: ${S.diet}
Targets: ${d} kcal/day, Protein ${m.protein}g, Carbs ${m.carbs}g, Fat ${m.fat}g. ${pantryStr}
Return ONLY a valid JSON array of exactly 4 meals:
[{"meal":"Breakfast","time":"08:00","calories":450,"protein":35,"carbs":45,"fat":12,"items":["item1","item2"],"tip":"brief tip"},...]
Make meals realistic and delicious. Total ~${d} kcal.`;

  const out=document.getElementById('meals-out');
  out.innerHTML=`<div class="loader"><div class="spinner"></div><div class="loader-txt">GENERATING YOUR MEAL PLAN...</div></div>`;
  try {
    const raw=await callAPI(prompt);
    const meals=parseArr(raw);
    out.innerHTML=meals.map(m=>`
      <div class="meal-card">
        <div class="meal-hdr"><div><div class="meal-name">${m.meal}</div></div><div class="meal-time">${m.time}</div></div>
        <div class="badges">
          <span class="badge b-cal">🔥 ${m.calories} kcal</span>
          <span class="badge b-pro">P: ${m.protein}g</span>
          <span class="badge b-carb">C: ${m.carbs}g</span>
          <span class="badge b-fat">F: ${m.fat}g</span>
        </div>
        <div class="meal-items">${Array.isArray(m.items)?m.items.join(' · '):m.items}</div>
        ${m.tip?`<div class="meal-tip">${m.tip}</div>`:''}
      </div>`).join('');
  } catch(e) {
    out.innerHTML=`<div class="err-card"><p>⚠️ Could not generate meal plan. Check your OpenAI API key in the header.<br><br><small>${e.message}</small></p><button class="btn btn-red btn-sm" onclick="genMeals()">Retry</button></div>`;
  }
}
