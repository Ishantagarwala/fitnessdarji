/* ══════════════════════════════════════════════════════
   TAB 7 — ALERTS
══════════════════════════════════════════════════════ */
function tabAlerts() {
  const p=document.getElementById('p-alerts');
  const items=[
    {k:'breakfast',icon:'🌅',name:'Breakfast',time:S.reminders.breakfast},
    {k:'lunch',    icon:'☀️',name:'Lunch',    time:S.reminders.lunch},
    {k:'dinner',   icon:'🌙',name:'Dinner',   time:S.reminders.dinner},
    {k:'workout',  icon:'💪',name:'Workout',  time:`${S.reminders.workout} · ${S.reminders.workoutDays}×/week`},
    {k:'water',    icon:'💧',name:'Water',    time:`Every ${S.reminders.waterInterval} min`},
  ];
  p.innerHTML=`
    <div class="sec-hdr"><div class="sec-title">Reminders & Alerts</div></div>
    <div class="notif-banner">
      <p>Enable browser notifications to get alerts in the background</p>
      <button class="btn btn-sm" onclick="reqNotif()">Enable</button>
    </div>
    <div class="card" style="margin:0 0 13px">
      ${items.map(r=>`
        <div class="rem-item">
          <div class="rem-info">
            <div class="rem-name">${r.icon} ${r.name}</div>
            <div class="rem-time">${r.time}</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${S.enabled[r.k]?'checked':''} onchange="togRem('${r.k}',this.checked)">
            <div class="t-track"></div><div class="t-thumb"></div>
          </label>
        </div>`).join('')}
    </div>
    <button class="btn" onclick="activateAll()">🔔 Activate All Reminders</button>`;
}

function togRem(key, on) {
  S.enabled[key]=on;
  if(on){
    if(key==='water') startWater();
    else if(!remLoop) startRemLoop();
    showNotif(`${key} reminder enabled`,'Reminder Set');
  } else {
    if(key==='water') stopWater();
  }
}

async function reqNotif() {
  if(Notification.permission==='granted'){showNotif('Notifications already enabled!');return;}
  const p=await Notification.requestPermission();
  p==='granted'?showNotif('Notifications enabled! 🔔','Permission Granted'):showNotif('Enable notifications in browser settings','Blocked');
}

function activateAll() {
  reqNotif().then(()=>{
    Object.keys(S.enabled).forEach(k=>S.enabled[k]=true);
    startRemLoop(); startWater();
    tabAlerts(); // re-render to show checked state
    showNotif('All reminders active! 🚀','दर्जी is watching');
  });
}

function startRemLoop() {
  if(remLoop) clearInterval(remLoop);
  remLoop=setInterval(()=>{
    const now=new Date();
    const hm=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    if(S.enabled.breakfast&&hm===S.reminders.breakfast) fireN('🌅 Breakfast','Time for breakfast! Keep those macros in check.');
    if(S.enabled.lunch     &&hm===S.reminders.lunch)    fireN('☀️ Lunch','Lunch time! Don\'t skip — fuel your engine.');
    if(S.enabled.dinner    &&hm===S.reminders.dinner)   fireN('🌙 Dinner','Dinner time! End the day strong.');
    if(S.enabled.workout   &&hm===S.reminders.workout)  fireN('💪 Workout',`Train time! Goal: ${S.goalLabel}`);
  },60000);
}

function startWater() {
  if(waterLoop) clearInterval(waterLoop);
  waterLoop=setInterval(()=>{
    if(S.enabled.water) fireN('💧 Hydrate','Drink a glass of water — stay at peak performance!');
  }, S.reminders.waterInterval*60000);
}
function stopWater(){ if(waterLoop){clearInterval(waterLoop);waterLoop=null;} }
