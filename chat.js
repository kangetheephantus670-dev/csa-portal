'use strict';
let $thread='group',$chatTimer;

document.addEventListener('DOMContentLoaded',()=>{
  const u=requireAuth();if(!u)return;
  buildTopbar('chat');buildDMList();showGroupChat();
  $chatTimer=setInterval(refreshChat,2500);
});

function buildDMList(){
  const el=document.getElementById('dm-list');if(!el)return;
  const db=DB.get(),u=getSession();
  el.innerHTML=db.directors.filter(d=>d.uid!==u.uid).map(d=>`
    <div class="cs-item" id="cs-${d.uid}" onclick="showDM('${d.uid}','${esc(d.name)}')">
      <div class="cs-av" style="background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;">${ini(d.name)}</div>
      <div class="cs-info"><div class="cs-name">${esc(d.name)}</div><div class="cs-preview">${roleName(d.role)}</div></div>
    </div>`).join('');
}

function setActive(id){document.querySelectorAll('.cs-item').forEach(i=>i.classList.remove('active'));const e=document.getElementById(id);if(e)e.classList.add('active');}

function showGroupChat(){
  $thread='group';setActive('cs-group');
  const db=DB.get();
  const hav=document.getElementById('ch-av');if(hav){hav.textContent='K';hav.style.background='linear-gradient(135deg,var(--green),var(--green3))';}
  const cn=document.getElementById('ch-name');if(cn)cn.textContent='Kikundi — Wasimamizi Wote';
  const cs=document.getElementById('ch-sub');if(cs)cs.textContent=db.directors.length+' wasimamizi';
  renderMsgs();
}

function showDM(uid,name){
  $thread=uid;setActive('cs-'+uid);
  const hav=document.getElementById('ch-av');if(hav){hav.textContent=ini(name);hav.style.background='linear-gradient(135deg,var(--blue),var(--blue2))';}
  const cn=document.getElementById('ch-name');if(cn)cn.textContent=name;
  const db=DB.get();const dir=db.directors.find(d=>d.uid===uid);
  const cs=document.getElementById('ch-sub');if(cs)cs.textContent=dir?roleName(dir.role):'Msimamizi';
  renderMsgs();
}

function renderMsgs(){
  const u=getSession();const db=DB.get();
  const msgs=$thread==='group'?(db.groupChat||[]):((db.dms||{})[[u.uid,$thread].sort().join('__')]||[]);
  const el=document.getElementById('chat-msgs');if(!el)return;
  if(!msgs.length){el.innerHTML='<div class="chat-empty">Hakuna ujumbe bado. Anza mazungumzo! 🎵</div>';return;}
  const atBot=el.scrollHeight-el.clientHeight-el.scrollTop<30;
  el.innerHTML=msgs.map(m=>{const out=m.uid===u.uid;return`
    <div class="msg-wrap ${out?'out':'in'}">
      ${!out?'<div class="msg-name">'+esc(m.name)+'</div>':''}
      <div class="msg-bubble ${out?'msg-out':'msg-in'}">${esc(m.text)}</div>
      <div class="msg-time">${fmtTime(m.ts)}</div>
    </div>`;}).join('');
  if(atBot||msgs.length<=20)el.scrollTop=el.scrollHeight;
  // Update sidebar preview
  if($thread==='group'&&msgs.length){const p=document.getElementById('gc-preview');if(p)p.textContent=msgs[msgs.length-1].text.slice(0,40);}
}

function sendMsg(){
  const u=getSession();const inp=document.getElementById('chat-inp');
  const t=inp?inp.value.trim():'';if(!t)return;
  if(inp){inp.value='';inp.style.height='auto';}
  const msg={id:'m_'+Date.now(),uid:u.uid,name:u.name,text:t,ts:Date.now()};
  if($thread==='group'){DB.update(d=>{if(!d.groupChat)d.groupChat=[];d.groupChat.push(msg);if(d.groupChat.length>500)d.groupChat.shift();});}
  else{const k=[u.uid,$thread].sort().join('__');DB.update(d=>{if(!d.dms)d.dms={};if(!d.dms[k])d.dms[k]=[];d.dms[k].push(msg);});}
  renderMsgs();
}

function refreshChat(){renderMsgs();}
