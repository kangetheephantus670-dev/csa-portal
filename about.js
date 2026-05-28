'use strict';
document.addEventListener('DOMContentLoaded',()=>{
  const u=requireAuth();if(!u)return;
  buildTopbar('about');renderAbout();
});
function renderAbout(){
  const u=getSession();const db=DB.get();
  const isLead=u&&(u.isOwner||['owner','chief','deputy'].includes(u.role));
  const btn=document.getElementById('btn-add-dir');if(btn)btn.style.display=isLead?'inline-flex':'none';
  // Directors
  const el=document.getElementById('about-dirs');
  if(el){
    const dirs=[...db.directors].sort((a,b)=>{const r={owner:0,chief:1,deputy:2,director:3,organist:4,conductor:5};return(r[a.role]||6)-(r[b.role]||6);});
    el.innerHTML=dirs.map(d=>`
      <div class="dir-row">
        <div class="dir-av">${ini(d.name)}</div>
        <div style="flex:1"><div class="dir-name-text">${esc(d.name)}</div>
          <div class="dir-role-text">${roleName(d.role)}${d.voice?' · '+esc(d.voice):''}</div></div>
        ${(isLead&&d.uid!==u.uid)?'<button class="btn btn-danger btn-xs" onclick="delDir(\''+d.uid+'\',\''+esc(d.name)+'\')">✕</button>':''}
      </div>`).join('');
  }
  // Stats
  const sEl=document.getElementById('about-stats');
  if(sEl)sEl.innerHTML=[['👥','Wasimamizi',db.directors.length],['🎵','Nyimbo',db.scores.length],['📄','Mwongozo',db.massOrders.length],['📢','Matangazo',db.announcements.length],['💬','Ujumbe',(db.groupChat||[]).length]]
    .map(([ic,lbl,v])=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:18px">${ic}</span><span style="color:var(--muted);font-size:13px;flex:1">${lbl}</span><strong style="color:var(--gold2);font-size:15px">${v}</strong></div>`).join('');
  // Social
  const socEl=document.getElementById('about-social');const s=db.settings;
  if(socEl)socEl.innerHTML=[['🎵 TikTok',s.tiktok||'—'],['▶️ YouTube',s.youtube||'—'],['📞 Simu',s.phone?(s.phone+(s.phoneRole?' ('+s.phoneRole+')':'')):' —']]
    .map(([lbl,v])=>`<div style="padding:7px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--muted)">${lbl}: </span><span>${esc(v)}</span></div>`).join('');
}
function doAddDir(){
  const name=(document.getElementById('nd-name')||{value:''}).value.trim();
  const uname=(document.getElementById('nd-uname')||{value:''}).value.trim();
  const pw=(document.getElementById('nd-pw')||{value:''}).value||'';
  const role=(document.getElementById('nd-role')||{value:'director'}).value||'director';
  const voice=(document.getElementById('nd-voice')||{value:''}).value||'';
  const phone=(document.getElementById('nd-phone')||{value:''}).value.trim()||'';
  const err=document.getElementById('nd-err');if(err)err.textContent='';
  if(!name)return err&&(err.textContent='Weka jina kamili.');
  if(!uname)return err&&(err.textContent='Weka jina la mtumiaji.');
  if(pw.length<4)return err&&(err.textContent='Neno la siri liwe na herufi 4+.');
  const db=DB.get();
  if(db.directors.find(d=>(d.username||'').toLowerCase()===uname.toLowerCase()))
    return err&&(err.textContent='Jina hilo la mtumiaji lipo tayari.');
  const u=getSession();
  DB.update(d=>d.directors.push({uid:'dir_'+Date.now(),name,username:uname,password:pw,role,voice,phone,addedAt:Date.now(),addedBy:u.name}));
  closeModal('modal-add-dir');
  ['nd-name','nd-uname','nd-pw','nd-phone'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  DB.log(u.name+' aliongeza msimamizi: "'+name+'"','👤');
  toast(name+' ameongezwa! 👤');renderAbout();
}
function delDir(uid,name){
  if(!confirm('Futa "'+name+'" kutoka kwaya?'))return;
  const u=getSession();
  DB.update(d=>{d.directors=d.directors.filter(x=>x.uid!==uid);});
  DB.log(u.name+' alifuta: "'+name+'"','🗑️');
  toast(name+' amefutwa.','info');renderAbout();
}
function renderOwnerPanel(){
  const db=DB.get();const el=document.getElementById('op-content');if(!el)return;
  el.innerHTML='<div class="op-sec"><div class="op-lbl">Wasimamizi ('+db.directors.length+')</div>'
    +'<div style="font-size:12px">'+db.directors.map(d=>'<div style="padding:3px 0">'+ini(d.name)+' '+esc(d.name)+' — '+roleName(d.role)+'</div>').join('')+'</div></div>'
    +'<div class="op-sec"><div class="op-lbl">Shughuli za Hivi Karibuni</div>'
    +'<div style="font-size:12px;max-height:180px;overflow-y:auto">'+db.activity.slice(0,12).map(a=>'<div style="padding:4px 0;border-bottom:1px solid var(--border)">'+a.ic+' '+esc(a.msg)+' <span style="color:var(--muted);font-size:10px">'+timeAgo(a.time)+'</span></div>').join('')+'</div></div>'
    +'<div class="op-sec"><button class="btn btn-danger btn-xs" style="width:100%;" onclick="if(confirm(\'Futa historia?\')){DB.update(d=>{d.activity=[];});renderOwnerPanel();toast(\'Historia imefutwa.\',\'info\')}">🗑️ Futa Historia</button></div>';
}
