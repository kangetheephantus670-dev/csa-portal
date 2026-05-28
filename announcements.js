'use strict';
document.addEventListener('DOMContentLoaded',()=>{
  const u=requireAuth();if(!u)return;
  buildTopbar('announcements');
  const isLead=u.isOwner||['owner','chief','deputy'].includes(u.role);
  const aa=document.getElementById('ann-actions');if(aa&&isLead)aa.style.display='flex';
  renderAnn();
});
function renderAnn(){
  const db=DB.get();const el=document.getElementById('ann-list');if(!el)return;
  const u=getSession();const isLead=u&&(u.isOwner||['owner','chief','deputy'].includes(u.role));
  const TYPE_IC={general:'📋',rehearsal:'🎵',urgent:'🚨',event:'🎉'};
  if(!db.announcements.length){el.innerHTML='<div class="empty"><span class="ei">📢</span><p>Hakuna matangazo bado.</p></div>';return;}
  el.innerHTML=db.announcements.map((a,i)=>`
    <div class="ann-card ann-${a.type||'general'}" style="animation-delay:${i*.05}s">
      <div class="ann-head">
        <span class="ann-type-ic">${TYPE_IC[a.type]||'📋'}</span>
        <div class="ann-title">${esc(a.title)}</div>
        ${isLead?'<button class="ann-del" onclick="delAnn(\''+a.id+'\')">✕</button>':''}
      </div>
      <div class="ann-body">${esc(a.body)}</div>
      <div class="ann-meta">
        <span>— ${esc(a.by)}</span><span>${timeAgo(a.createdAt)}</span>
        <span style="background:rgba(255,255,255,.06);padding:2px 8px;border-radius:10px;font-size:10px;">${a.type||'general'}</span>
      </div>
    </div>`).join('');
}
function doPostAnn(){
  const title=(document.getElementById('ann-title')||{value:''}).value.trim();
  const body=(document.getElementById('ann-body')||{value:''}).value.trim();
  const type=(document.getElementById('ann-type')||{value:'general'}).value||'general';
  const err=document.getElementById('ann-err');if(err)err.textContent='';
  if(!title)return err&&(err.textContent='Weka kichwa cha habari.');
  if(!body)return err&&(err.textContent='Weka ujumbe.');
  const u=getSession();
  DB.update(d=>d.announcements.unshift({id:'ann_'+Date.now(),title,body,type,by:u.name,byUid:u.uid,createdAt:Date.now()}));
  closeModal('modal-ann');
  const ti=document.getElementById('ann-title');if(ti)ti.value='';
  const bi=document.getElementById('ann-body');if(bi)bi.value='';
  DB.log(u.name+' alituma tangazo: "'+title+'"','📢');
  toast('Tangazo limetumwa! 📢');renderAnn();
}
function delAnn(id){
  if(!confirm('Futa tangazo hili?'))return;
  DB.update(d=>{d.announcements=d.announcements.filter(a=>a.id!==id);});
  toast('Tangazo limefutwa.','info');renderAnn();
}
