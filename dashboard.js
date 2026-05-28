'use strict';
function renderOwnerPanel(){
  const db=DB.get(),el=$('op-content');if(!el)return;
  el.innerHTML=`<div class="op-sec"><div class="op-lbl">Wasimamizi (${db.directors.length})</div>
  <div style="font-size:12px">${db.directors.map(d=>`<div style="padding:3px 0">${ini(d.name)} — ${roleName(d.role)}</div>`).join('')}</div></div>
  <div class="op-sec"><div class="op-lbl">Shughuli za Hivi Karibuni</div>
  <div style="font-size:12px;max-height:180px;overflow-y:auto">${db.activity.slice(0,12).map(a=>`<div style="padding:4px 0;border-bottom:1px solid var(--border)">${a.ic} ${esc(a.msg)} <span style="color:var(--muted);font-size:10px">${timeAgo(a.time)}</span></div>`).join('')}</div></div>
  <div class="op-sec"><div style="font-size:12px"><div>Nyimbo: <b>${db.scores.length}</b></div><div>Mwongozo: <b>${db.massOrders.length}</b></div><div>Matangazo: <b>${db.announcements.length}</b></div></div></div>`;
}
document.addEventListener('DOMContentLoaded',()=>{
  const u=requireAuth();if(!u)return;
  AI.load();
  const hr=new Date().getHours();
  const g=hr<12?'Habari za asubuhi':hr<17?'Habari za mchana':'Habari za jioni';
  txt('hw-greet',g+', '+u.name.split(' ')[0]+'.');
  txt('hw-sub','Karibu kwenye Mfumo wa Wasimamizi wa Kwaya.');
  const n=new Date();
  txt('hw-day',n.getDate());
  txt('hw-month',n.toLocaleDateString('sw-KE',{month:'long',year:'numeric'}));
  const db=DB.get();
  txt('st-dirs',db.directors.length);txt('st-scores',db.scores.length);
  txt('st-orders',db.massOrders.length);txt('st-msgs',db.groupChat?db.groupChat.length:0);
  txt('st-anns',db.announcements.length);
  // Recent announcements
  const TYPE_IC={general:'📋',rehearsal:'🎵',urgent:'🚨',event:'🎉'};
  const annEl=$('home-anns');
  if(annEl)annEl.innerHTML=db.announcements.length
    ?db.announcements.slice(0,3).map(a=>`<div class="ann-card ann-${a.type||'general'}" style="margin-bottom:10px;cursor:pointer" onclick="location.href='announcements.html'">
        <div class="ann-head"><span class="ann-type-ic">${TYPE_IC[a.type]||'📋'}</span><div class="ann-title">${esc(a.title)}</div></div>
        <div class="ann-body">${esc(a.body).slice(0,120)}${a.body.length>120?'…':''}</div>
        <div class="ann-meta"><span>— ${esc(a.by)}</span><span>${timeAgo(a.createdAt)}</span></div>
      </div>`).join('')
    :'<p style="color:var(--muted);font-size:13px;padding:10px 0">Hakuna matangazo bado.</p>';
  // Owner extras
  const isLead=u.isOwner||['owner','chief','deputy'].includes(u.role);
  if(isLead){
    const os=$('owner-sec');if(os)os.style.display='';
    const actEl=$('activity-list');
    if(actEl)actEl.innerHTML=db.activity.slice(0,10).map((a,i)=>`<div class="act-item" style="animation-delay:${i*.04}s"><span class="act-ic">${a.ic}</span><div><div class="act-text">${esc(a.msg)}</div><div class="act-time">${timeAgo(a.time)} · ${esc(a.by)}</div></div></div>`).join('');
  }
});
