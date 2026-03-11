/* ══════════════════════════════════════════════════════
   TAB 9 — AI COACH
══════════════════════════════════════════════════════ */
function tabCoach() {
  const p=document.getElementById('p-coach');
  if(p.dataset.built) return;
  p.dataset.built='1';
  p.innerHTML=`
    <div class="sec-hdr">
      <div class="sec-title">AI Coach</div>
      <div style="font-size:10px;color:var(--accent)"><span class="online-dot"></span>ONLINE</div>
    </div>
    <div class="chat-wrap">
      <div class="chat-msgs" id="chat-msgs">
        <div class="msg ai">
          <div>Namaste! 🙏 I'm your AI health coach, fully briefed on your profile.<br><br>
          <strong>${S.gender}, ${S.age}yo · ${S.weight}kg → ${S.targetWeight}kg · ${S.goalLabel}</strong><br><br>
          Ask me anything — nutrition, workouts, motivation, science, or just a pep talk. मैं यहाँ हूँ!</div>
          <div class="msg-t">${getTime()}</div>
        </div>
      </div>
      <div class="chat-inp-row">
        <textarea class="chat-input" id="chat-inp" placeholder="Ask your AI coach…" rows="1"
          onkeydown="chatKey(event)" oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea>
        <button class="chat-send" onclick="sendChat()">→</button>
      </div>
    </div>`;
}

function getTime(){ return new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}); }

function chatKey(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();} }

async function sendChat() {
  const inp=document.getElementById('chat-inp');
  const msg=inp.value.trim();
  if(!msg) return;
  inp.value=''; inp.style.height='auto';

  const msgs=document.getElementById('chat-msgs');
  const um=document.createElement('div');
  um.className='msg';
  um.innerHTML=`<div>${msg.replace(/\n/g,'<br>')}</div><div class="msg-t">${getTime()}</div>`;
  msgs.appendChild(um);

  const typing=document.createElement('div');
  typing.className='typing';
  typing.innerHTML='<div class="td"></div><div class="td"></div><div class="td"></div>';
  msgs.appendChild(typing);
  msgs.scrollTop=msgs.scrollHeight;

  chatHist.push({r:'user',c:msg});

  const m=macros();
  const ctx=`You are दर्जी AI Coach, a warm, science-backed personal health coach.
User profile: ${S.age}yo ${S.gender}, ${S.height}cm, ${S.weight}kg, Activity: ${S.activity}
Goal: ${S.goalLabel} | Target: ${S.targetWeight}kg @ ${S.pace}kg/wk | Diet: ${S.diet}
Daily calories: ${Math.round(daily())} kcal | Macros: P${m.protein}g C${m.carbs}g F${m.fat}g
Pantry: ${S.pantry.length?S.pantry.join(', '):'not specified'}
Respond warmly in <150 words unless deep explanation needed. Use occasional Hindi words for personality.
Recent conversation:
${chatHist.slice(-8).map(h=>`${h.r==='user'?'User':'Coach'}: ${h.c}`).join('\n')}
User: ${msg}
Coach:`;

  try {
    const response=await callAPI(ctx);
    chatHist.push({r:'ai',c:response});
    typing.remove();
    const am=document.createElement('div');
    am.className='msg ai';
    am.innerHTML=`<div>${response.replace(/\n/g,'<br>')}</div><div class="msg-t">${getTime()}</div>`;
    msgs.appendChild(am);
  } catch(e) {
    typing.remove();
    const em=document.createElement('div');
    em.className='msg ai';
    em.innerHTML=`<div style="color:var(--accent2)">⚠️ OpenAI connection failed. Check your API key in the header bar.</div>`;
    msgs.appendChild(em);
  }
  msgs.scrollTop=msgs.scrollHeight;
}
