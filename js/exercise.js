/* ══════════════════════════════════════════════════════
   TAB 4 — EXERCISE
══════════════════════════════════════════════════════ */
function tabExercise() {
  const p=document.getElementById('p-exercise');
  if(p.dataset.built) return;
  p.dataset.built='1';
  p.innerHTML=`
    <div class="sec-hdr"><div class="sec-title">Workout Plan</div></div>
    <div class="card" style="margin:0 0 13px;text-align:center">
      <div style="font-size:11px;color:var(--muted);margin-bottom:12px;line-height:1.7">
        <strong style="color:var(--text)">${S.reminders.workoutDays}-day/week</strong> program<br>
        Optimized for <strong style="color:var(--accent)">${S.goalLabel}</strong>
      </div>
      <button class="btn" onclick="genWorkout()">Generate My Workout Plan</button>
    </div>
    <div id="workout-out"></div>`;
}

async function genWorkout() {
  const prompt=`You are an expert personal trainer. Create a ${S.reminders.workoutDays}-day/week workout plan.
User: ${S.age}yo ${S.gender}, ${S.weight}kg, Activity: ${S.activity}, Goal: ${S.goalLabel}
Return ONLY a valid JSON array of ${S.reminders.workoutDays} day objects:
[{"day":"Day 1","focus":"Upper Body / Chest & Triceps","duration":"45 min","exercises":[{"name":"Bench Press","sets":4,"reps":"8-10","rest":"90s","tip":"Keep shoulder blades retracted"},...]}]
Include 4-6 exercises per day. Make it progressive and goal-appropriate.`;

  const out=document.getElementById('workout-out');
  out.innerHTML=`<div class="loader"><div class="spinner"></div><div class="loader-txt">BUILDING YOUR PROGRAM...</div></div>`;
  try {
    const raw=await callAPI(prompt);
    const days=parseArr(raw);
    out.innerHTML=days.map(d=>`
      <div class="day-card">
        <div class="day-hdr">
          <div><div class="day-title">${d.day}</div><div class="day-meta">${d.focus}</div></div>
          <div class="day-meta">⏱ ${d.duration}</div>
        </div>
        ${(d.exercises||[]).map(ex=>`
          <div class="ex-item">
            <input type="checkbox" class="ex-check" onchange="this.closest('.ex-item').classList.toggle('done',this.checked)">
            <div class="ex-info">
              <div class="ex-name">${ex.name}</div>
              <div class="ex-meta">${ex.sets} sets × ${ex.reps} reps · Rest: ${ex.rest}</div>
              ${ex.tip?`<div class="ex-tip">${ex.tip}</div>`:''}
            </div>
          </div>`).join('')}
      </div>`).join('');
  } catch(e) {
    out.innerHTML=`<div class="err-card"><p>⚠️ Could not generate workout. Check your OpenAI API key in the header.<br><br><small>${e.message}</small></p><button class="btn btn-red btn-sm" onclick="genWorkout()">Retry</button></div>`;
  }
}
