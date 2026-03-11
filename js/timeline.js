/* ══════════════════════════════════════════════════════
   TAB 2 — TIMELINE
══════════════════════════════════════════════════════ */
function tabTimeline() {
  const p=document.getElementById('p-timeline');
  const tl=timeline();
  const diff=S.weight-S.targetWeight;
  const isLoss=diff>0;
  const absDiff=Math.abs(diff);

  const milestones=[0,.25,.5,.75,1].map((pct,i)=>{
    const wt=isLoss ? S.weight-absDiff*pct : S.weight+absDiff*pct;
    const wk=Math.round(tl.weeks*pct);
    return {pct:Math.round(pct*100),wt:wt.toFixed(1),wk,i};
  });

  const msHTML=milestones.map(m=>`
    <div class="milestone-card${m.i===0?' ms':m.i===4?' mg':''}">
      <div class="m-pct">${m.i===0?'START':m.i===4?'GOAL 🎯':m.pct+'%'}</div>
      <div class="m-wt">${m.wt}kg</div>
      <div class="m-wk">${m.wk>0?'Week '+m.wk:'Day 1'}</div>
    </div>`).join('');

  const endDateStr=tl.end.toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'});

  p.innerHTML=`
    <div class="sec-hdr"><div class="sec-title">Journey Roadmap</div></div>
    <div class="milestone-row">${msHTML}</div>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-lbl">Total Change</div><div class="stat-val" style="font-size:22px">${absDiff.toFixed(1)}</div><div class="stat-unit">kg to ${isLoss?'lose':'gain'}</div></div>
      <div class="stat-box"><div class="stat-lbl">Duration</div><div class="stat-val" style="font-size:22px">${tl.weeks}</div><div class="stat-unit">wks · ${tl.months} months</div></div>
    </div>
    <div class="stat-box" style="margin-bottom:14px;text-align:center">
      <div class="stat-lbl" style="margin-bottom:5px">Estimated Completion</div>
      <div style="font-family:var(--display);font-size:17px;font-weight:700;color:var(--accent3)">${endDateStr}</div>
    </div>
    <div class="proto-card">
      <div class="proto-title">📋 Weekly Protocol</div>
      ${isLoss?`
        <div class="proto-rule">Sustain ${Math.round(daily())} kcal/day dietary target</div>
        <div class="proto-rule">Strength train ${S.reminders.workoutDays}×/week — preserve muscle</div>
        <div class="proto-rule">Track every meal: accuracy = results</div>
        <div class="proto-rule">Sleep 7–9 hours — cortisol wrecks fat loss</div>
        <div class="proto-rule">Drink 2.5–3L water daily for metabolism</div>
        <div class="proto-rule">Weigh in every morning, track weekly average</div>`:`
        <div class="proto-rule">Hit ${Math.round(daily())} kcal/day surplus daily</div>
        <div class="proto-rule">Progressive overload every training session</div>
        <div class="proto-rule">Protein: hit ${macros().protein}g/day minimum</div>
        <div class="proto-rule">Sleep 8–9 hours — muscle is built during rest</div>
        <div class="proto-rule">Monitor fat gain: if >1kg/wk, cut surplus</div>
        <div class="proto-rule">Deload every 6–8 weeks to prevent injury</div>`}
    </div>
    <div class="proto-card">
      <div class="proto-title">⚡ ${isLoss?'Deficit':'Surplus'} Strategy</div>
      ${isLoss?`
        <div class="proto-rule">Primary: Nutrition deficit of ${Math.abs(S.goal)} kcal from diet</div>
        <div class="proto-rule">Secondary: Exercise adds to deficit — don't double-count</div>
        <div class="proto-rule">Planned cheat meal: 1×/week max (see Cheat Meal tab)</div>
        <div class="proto-rule">Refeed day every 4 weeks if weight stalls for >2 weeks</div>`:`
        <div class="proto-rule">Surplus: +${S.goal} kcal above TDEE every day</div>
        <div class="proto-rule">Time carbs pre- and post-workout for glycogen</div>
        <div class="proto-rule">Cap cardio at 2×/week during bulk phase</div>
        <div class="proto-rule">Reassess every 4 weeks — adjust based on progress</div>`}
    </div>`;
}
