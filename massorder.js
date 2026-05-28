'use strict';
let $bgCustom=null,$bgIdx=0,$ovIdx=0,$zoom=0.8;
let $logo1=null,$logo2=null,$pdf=null;
let $extraIds=[],$subCounts={},$condC={1:0,2:0,3:0};
let $autosave=null,$aiTmr=null;

document.addEventListener('DOMContentLoaded',()=>{
  const u=requireAuth();if(!u)return;
  buildTopbar('massorder');AI.load();
  const db=DB.get(),s=db.settings;
  const el=document.getElementById('p-date');if(el)el.value=new Date().toISOString().split('T')[0];
  const setF=(id,v)=>{const e=document.getElementById(id);if(e&&!e.value)e.value=v;};
  setF('p-tiktok',s.tiktok||'');setF('p-youtube',s.youtube||'');
  setF('p-phone',s.phone||'');setF('p-phone-role',s.phoneRole||'');
  setF('p-motto',s.motto||'KWA KUIMBA TWAENEZA INJILI');
  buildBgSwatches();buildOvSwatches();buildSongsEditor();buildCondsEditor();buildDirDatalist();
  const zw=document.getElementById('poster-zoom-wrap');if(zw)zw.style.transform='scale('+$zoom+')';
  document.getElementById('zoom-lbl').textContent=Math.round($zoom*100)+'%';
  updatePosterLogos();loadDraft();renderPoster();
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();saveDraft();toast('Rasimu imehifadhiwa ✓');}
    if((e.ctrlKey||e.metaKey)&&e.key==='p'){e.preventDefault();printPoster();}
  });
});

function buildDirDatalist(){const dl=document.getElementById('dir-dl');if(!dl)return;const db=DB.get();dl.innerHTML=db.directors.map(d=>'<option value="'+esc(d.name)+'">').join('');}
function buildBgSwatches(){const el=document.getElementById('bg-swatches');if(!el)return;el.innerHTML=BG_PRESETS.map((b,i)=>'<div class="swatch'+(i===0?' on':'')+'" style="background:'+b.bg+'" title="'+b.n+'" onclick="selBg('+i+',this)">'+b.ic+'</div>').join('');}
function buildOvSwatches(){const el=document.getElementById('ov-swatches');if(!el)return;el.innerHTML=OVERLAY_OPTS.map((o,i)=>'<div class="ov-swatch'+(i===0?' on':'')+'" style="background:'+o.v+'0.85)" title="'+o.n+'" onclick="selOv('+i+',this)"></div>').join('');}
function selBg(i,el){$bgIdx=i;$bgCustom=null;document.querySelectorAll('.swatch').forEach(s=>s.classList.remove('on'));el.classList.add('on');renderPoster();}
function selOv(i,el){$ovIdx=i;document.querySelectorAll('.ov-swatch').forEach(s=>s.classList.remove('on'));el.classList.add('on');renderPoster();}
function onBgDrop(e){e.preventDefault();document.getElementById('bg-drop').classList.remove('drag');const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))readBgFile(f);}
function onBgFile(inp){if(inp.files[0])readBgFile(inp.files[0]);}
function readBgFile(f){const r=new FileReader();r.onload=e=>{$bgCustom=e.target.result;const c=document.getElementById('bg-chosen');if(c)c.textContent='✓ '+f.name;document.querySelectorAll('.swatch').forEach(s=>s.classList.remove('on'));renderPoster();};r.readAsDataURL(f);}
function onLogoFile(inp,n){if(!inp.files[0])return;const r=new FileReader();r.onload=e=>{const d=e.target.result;if(n===1){$logo1=d;const p=document.getElementById('logo1-prev');if(p)p.innerHTML='<img src="'+d+'" style="max-height:46px;max-width:100%;object-fit:contain;" alt="L1"/>';}else{$logo2=d;const p=document.getElementById('logo2-prev');if(p)p.innerHTML='<img src="'+d+'" style="max-height:46px;max-width:100%;object-fit:contain;" alt="L2"/>';}updatePosterLogos();renderPoster();};r.readAsDataURL(inp.files[0]);}
function updatePosterLogos(){const l1=document.getElementById('pr-logo1');const l2=document.getElementById('pr-logo2');if(l1){const i=l1.querySelector('img');if(i)i.src=$logo1||LOGO_UNI;}if(l2){const i=l2.querySelector('img');if(i)i.src=$logo2||LOGO_CHOIR;}}

function buildSongsEditor(){
  const el=document.getElementById('songs-editor');if(!el)return;
  el.innerHTML=FIXED_SONGS.map((s,i)=>`<div class="song-item" id="si-${s.id}">
    <div class="si-head"><div class="si-num fixed">${i+1}</div><div class="si-lbl">${s.lbl}</div></div>
    <div class="sub-row" id="sr-${s.id}-0">
      <input class="ei" id="sn-${s.id}-0" placeholder="Jina la wimbo..." list="dir-dl" autocomplete="off"
        oninput="AI.trackSong(this.value);schedAI();renderPoster()"/>
      <select class="esl" id="sk-${s.id}-0" onchange="AI.trackKey(this.value,'${s.id}',document.getElementById('p-season').value||'');schedAI();renderPoster()">
        <option value="">Key...</option>${MUSICAL_KEYS.map(k=>'<option>'+k+'</option>').join('')}
      </select>
      <button class="btn-rm" onclick="addSub('${s.id}')" style="color:var(--gold2);font-size:22px;font-weight:200;line-height:1">+</button>
    </div>
    <div id="subs-${s.id}"></div>
  </div>`).join('');
}
function schedAI(){clearTimeout($aiTmr);$aiTmr=setTimeout(showAI,900);}
function showAI(){
  if(AI.d.total<3)return;
  const sea=document.getElementById('p-season').value||'';
  const keys=AI.suggestKeys('',sea,6);
  const panel=document.getElementById('ai-panel'),chips=document.getElementById('ai-chips');
  if(!panel||!chips||!keys.length)return;
  chips.innerHTML='<span style="font-size:10px;color:var(--muted);margin-right:4px">Ufunguo:</span>'+keys.map(k=>'<div class="ai-chip" onclick="applyKey(\''+k+'\')">'+k+'</div>').join('');
  panel.style.display='block';
}
function applyKey(key){
  for(const s of FIXED_SONGS)for(let j=0;j<=($subCounts[s.id]||0);j++){const sel=document.getElementById('sk-'+s.id+'-'+j);if(sel&&!sel.value){sel.value=key;break;}}
  renderPoster();toast('Ufunguo '+key+' umewekwa','info');
}
function addSub(sid){
  $subCounts[sid]=($subCounts[sid]||0)+1;const n=$subCounts[sid];
  const c=document.getElementById('subs-'+sid);if(!c)return;
  const row=document.createElement('div');row.className='sub-row';row.id='sr-'+sid+'-'+n;
  row.innerHTML='<input class="ei" id="sn-'+sid+'-'+n+'" placeholder="Wimbo mwingine..." style="font-size:12.5px;padding:8px 10px" oninput="renderPoster()"/>'
    +'<select class="esl" id="sk-'+sid+'-'+n+'" style="font-size:12px;padding:8px 10px;min-width:90px" onchange="renderPoster()"><option value="">Key...</option>'+MUSICAL_KEYS.map(k=>'<option>'+k+'</option>').join('')+'</select>'
    +'<button class="btn-rm" onclick="this.closest(\'.sub-row\').remove();renderPoster()">&#x2715;</button>';
  c.appendChild(row);
}
let $xCount=0;
function addExtraSong(){
  $xCount++;const id='ex'+$xCount;$extraIds.push(id);
  const c=document.getElementById('songs-editor');if(!c)return;
  const div=document.createElement('div');div.className='song-item extra';div.id='si-'+id;
  div.innerHTML='<div class="si-head"><div class="si-num extra">+</div><div class="si-lbl extra">Wimbo wa Ziada '+$xCount+'</div><button class="btn-rm" onclick="rmExtra(\''+id+'\')">&#x2715;</button></div>'
    +'<div class="ef" style="margin-bottom:8px"><label class="el">Weka Baada ya</label>'
    +'<select class="esl" id="after-'+id+'" onchange="renderPoster()" style="font-size:12px"><option value="end">Mwishoni</option>'+FIXED_SONGS.map(s=>'<option value="'+s.id+'">'+s.lbl+'</option>').join('')+'</select></div>'
    +'<div class="sub-row"><input class="ei" id="exn-'+id+'" placeholder="Jina la wimbo..." style="font-size:12.5px;padding:8px 10px" oninput="renderPoster()"/>'
    +'<select class="esl" id="exk-'+id+'" style="font-size:12px;padding:8px 10px;min-width:90px" onchange="renderPoster()"><option value="">Key...</option>'+MUSICAL_KEYS.map(k=>'<option>'+k+'</option>').join('')+'</select></div>';
  c.appendChild(div);
}
function rmExtra(id){$extraIds=$extraIds.filter(x=>x!==id);const e=document.getElementById('si-'+id);if(e)e.remove();renderPoster();}
function clearAllSongs(){if(!confirm('Futa nyimbo zote?'))return;document.querySelectorAll('[id^="sn-"],[id^="sk-"]').forEach(e=>{e.tagName==='SELECT'?e.value='':e.value='';});$extraIds.forEach(id=>{const e=document.getElementById('si-'+id);if(e)e.remove();});$extraIds=[];$xCount=0;$subCounts={};renderPoster();toast('Nyimbo zimefutwa.','info');}
function onSeasonChange(){renderPoster();showAI();}

function buildCondsEditor(){
  const el=document.getElementById('conds-editor');if(!el)return;
  el.innerHTML=[1,2,3].map(m=>'<div class="cond-block"><div class="cond-title">Misa '+['ya Kwanza (M1)','ya Pili (M2)','ya Tatu (M3)'][m-1]+'</div><div id="cr-'+m+'"></div><button class="btn-add-sub" onclick="addCond('+m+')">+ Ongeza Msimamizi / Kondakta</button></div>').join('');
}
function addCond(m){
  $condC[m]++;const n=$condC[m];const c=document.getElementById('cr-'+m);if(!c)return;
  const row=document.createElement('div');row.className='cond-row';row.id='crow-'+m+'-'+n;
  row.innerHTML='<input class="ei" id="cd-'+m+'-'+n+'" list="dir-dl" placeholder="Jina la msimamizi..." style="font-size:13px;padding:9px 11px" oninput="renderPoster()"/>'
    +'<button class="btn-rm" onclick="document.getElementById(\'crow-'+m+'-'+n+'\').remove();renderPoster()">&#x2715;</button>';
  c.appendChild(row);
}

function renderPoster(){
  const v=id=>document.getElementById(id)?document.getElementById(id).value:'';
  const date=v('p-date'),occ=v('p-occasion'),sea=v('p-season'),time=v('p-time'),
    venue=v('p-venue'),notes=v('p-notes'),tt=v('p-tiktok'),yt=v('p-youtube'),
    ph=v('p-phone'),phr=v('p-phone-role'),motto=v('p-motto')||'KWA KUIMBA TWAENEZA INJILI',
    opacity=parseInt(v('overlay-range')||75);
  const bgL=document.getElementById('pr-bg');
  if(bgL){if($bgCustom){bgL.style.backgroundImage="url('"+$bgCustom+"')";bgL.style.background='';}else{bgL.style.backgroundImage='';bgL.style.background=BG_PRESETS[$bgIdx].bg;}}
  const ovL=document.getElementById('pr-ov');if(ovL)ovL.style.background=OVERLAY_OPTS[$ovIdx].v+(opacity/100)+')';
  updatePosterLogos();
  let col=SEASON_COL['default'];
  for(const[k,c]of Object.entries(SEASON_COL)){if(sea.toLowerCase().includes(k.toLowerCase())){col=c;break;}}
  const occEl=document.getElementById('pr-occasion');
  if(occEl){occEl.textContent=occ||'MWONGOZO WA NYIMBO';occEl.style.color=col.occ;}
  const dtEl=document.getElementById('pr-date-txt');
  if(dtEl)dtEl.textContent=date?new Date(date+'T12:00:00').toLocaleDateString('sw-KE',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).toUpperCase():'— TAREHE —';
  const setMeta=(sep,wrap,val)=>{const s=document.getElementById(sep),w=document.getElementById(wrap);if(val){if(s)s.style.display='';if(w){w.style.display='';const sp=w.querySelector('span');if(sp)sp.textContent=val;}}else{if(s)s.style.display='none';if(w)w.style.display='none';}};
  setMeta('pr-time-sep','pr-time-wrap',time);setMeta('pr-venue-sep','pr-venue-wrap',venue);
  const sBar=document.getElementById('pr-season');
  if(sea){if(sBar){sBar.style.display='';sBar.textContent=sea.toUpperCase();sBar.style.color=col.bar;}}else{if(sBar)sBar.style.display='none';}
  const rows=buildSongRows();
  const sg=document.getElementById('pr-songs-grid');
  if(sg)sg.innerHTML=rows.map(r=>{
    const lines=r.names.length?r.names.map(n=>'<span class="pr-song-line">'+esc(n.name)+(n.key?'<span class="pr-key"> -'+esc(n.key)+'</span>':'')+'</span>').join(''):'<span style="color:rgba(255,255,255,.2);font-size:8pt;font-style:italic">—</span>';
    return'<div class="pr-song-entry"><span class="pr-sec-name">'+esc(r.sec)+'</span>'+lines+'</div>';
  }).join('');
  const nb=document.getElementById('pr-notes-block'),nt=document.getElementById('pr-notes-text');
  if(notes.trim()){if(nb)nb.style.display='';if(nt)nt.textContent=notes;}else{if(nb)nb.style.display='none';}
  const cg=document.getElementById('pr-conds');
  if(cg)cg.innerHTML=[1,2,3].map(m=>{const names=[];document.querySelectorAll('[id^="cd-'+m+'-"]').forEach(i=>{if(i.value.trim())names.push(i.value.trim());});return'<div class="pr-cond-col"><span class="pr-cond-lbl">CONDS/ORGS M'+m+'</span><div class="pr-cond-names">'+(names.length?names.join('<br/>'):'—')+'</div></div>';}).join('');
  const sw=document.getElementById('pr-social-wrap');const socItems=[];
  if(tt)socItems.push('<span style="display:flex;align-items:center;gap:4px">♪ TikTok: '+esc(tt)+'</span>');
  if(yt)socItems.push('<span style="display:flex;align-items:center;gap:4px">▶ Youtube: '+esc(yt)+'</span>');
  if(ph)socItems.push('<span style="display:flex;align-items:center;gap:4px">📞 '+esc(ph)+(phr?' <span style="font-size:7pt">'+esc(phr)+'</span>':'')+'</span>');
  if(sw){if(socItems.length){sw.style.display='';sw.innerHTML='<div style="width:100%;text-align:center;"><span class="pr-social-header">Tufuate kwenye mitandao ya kijamii</span><div class="pr-social">'+socItems.join('')+'</div></div>';}else sw.style.display='none';}
  const dbEl=document.getElementById('pr-date-display');if(dbEl)dbEl.textContent=date?new Date(date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}).toUpperCase():'—';
  const yrEl=document.getElementById('pr-year');if(yrEl)yrEl.textContent=date?new Date(date+'T12:00:00').getFullYear():new Date().getFullYear();
  const motEl=document.getElementById('pr-final-motto');if(motEl)motEl.textContent=motto.toUpperCase();
  const ft=document.getElementById('pr-footer');if(ft)ft.style.background=OVERLAY_OPTS[$ovIdx].v+Math.min(opacity/100+0.15,0.96)+')';
  clearTimeout($autosave);$autosave=setTimeout(saveDraft,2000);
}

function buildSongRows(){
  const rows=[];
  FIXED_SONGS.forEach(s=>{
    const n=$subCounts[s.id]||0,names=[];
    for(let j=0;j<=n;j++){const nm=(document.getElementById('sn-'+s.id+'-'+j)||{value:''}).value.trim(),key=(document.getElementById('sk-'+s.id+'-'+j)||{value:''}).value;if(nm)names.push({name:nm,key});}
    rows.push({sec:s.lbl,names});
    $extraIds.forEach(id=>{if((document.getElementById('after-'+id)||{value:''}).value===s.id){const nm=(document.getElementById('exn-'+id)||{value:''}).value.trim(),k=(document.getElementById('exk-'+id)||{value:''}).value;if(nm)rows.push({sec:'—',names:[{name:nm,key:k}]});}});
  });
  $extraIds.forEach(id=>{const av=(document.getElementById('after-'+id)||{value:'end'}).value;if(av==='end'||!av){const nm=(document.getElementById('exn-'+id)||{value:''}).value.trim(),k=(document.getElementById('exk-'+id)||{value:''}).value;if(nm)rows.push({sec:'—',names:[{name:nm,key:k}]});}});
  return rows;
}

function zoomPoster(d){$zoom=Math.max(0.4,Math.min(1.5,$zoom+d*.1));const zw=document.getElementById('poster-zoom-wrap');if(zw)zw.style.transform='scale('+$zoom+')';document.getElementById('zoom-lbl').textContent=Math.round($zoom*100)+'%';}

function printPoster(){
  const rec={occasion:(document.getElementById('p-occasion')||{value:''}).value,season:(document.getElementById('p-season')||{value:''}).value,date:(document.getElementById('p-date')||{value:''}).value,songs:buildSongRows(),createdBy:getSession().name,savedAt:Date.now()};
  DB.update(d=>{d.massOrders.unshift(rec);if(d.massOrders.length>50)d.massOrders.pop();});
  DB.log(getSession().name+' alitoa mwongozo wa misa','📄');
  const zw=document.getElementById('poster-zoom-wrap');const saved=$zoom;if(zw)zw.style.transform='scale(1)';
  window.print();
  setTimeout(()=>{if(zw)zw.style.transform='scale('+saved+')';},1000);
}

function saveDraft(){
  try{
    const vals={};['p-date','p-time','p-occasion','p-season','p-venue','p-notes','p-tiktok','p-youtube','p-phone','p-phone-role','p-motto','overlay-range'].forEach(id=>{const e=document.getElementById(id);if(e)vals[id]=e.value;});
    const songs=FIXED_SONGS.map(s=>({id:s.id,subs:Array.from({length:($subCounts[s.id]||0)+1},(_,j)=>({n:(document.getElementById('sn-'+s.id+'-'+j)||{value:''}).value,k:(document.getElementById('sk-'+s.id+'-'+j)||{value:''}).value}))}));
    const conds={};[1,2,3].forEach(m=>{conds[m]=[...document.querySelectorAll('[id^="cd-'+m+'-"]')].map(i=>i.value).filter(Boolean);});
    localStorage.setItem('uecsa_draft_v4',JSON.stringify({vals,songs,conds,bgIdx:$bgIdx,ovIdx:$ovIdx}));
  }catch(e){}
}

function loadDraft(){
  try{
    const raw=localStorage.getItem('uecsa_draft_v4');if(!raw)return;
    const d=JSON.parse(raw);
    Object.entries(d.vals||{}).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.value=v;});
    const ol=document.getElementById('overlay-lbl'),or=document.getElementById('overlay-range');if(ol&&or)ol.textContent=or.value+'%';
    if(d.bgIdx!==undefined){$bgIdx=d.bgIdx;document.querySelectorAll('.swatch').forEach((b,i)=>b.classList.toggle('on',i===d.bgIdx));}
    if(d.ovIdx!==undefined){$ovIdx=d.ovIdx;document.querySelectorAll('.ov-swatch').forEach((s,i)=>s.classList.toggle('on',i===d.ovIdx));}
    (d.songs||[]).forEach(s=>s.subs.forEach((sub,j)=>{if(j>0&&sub.n)addSub(s.id);const ne=document.getElementById('sn-'+s.id+'-'+j);const ke=document.getElementById('sk-'+s.id+'-'+j);if(ne)ne.value=sub.n||'';if(ke)ke.value=sub.k||'';}));
    if(d.conds)[1,2,3].forEach(m=>{(d.conds[m]||[]).forEach(name=>{addCond(m);const cnt=$condC[m];const inp=document.getElementById('cd-'+m+'-'+cnt);if(inp)inp.value=name;});});
    renderPoster();
  }catch(e){}
}

function resetPoster(){
  if(!confirm('Futa mwongozo wote na uanze upya?'))return;
  localStorage.removeItem('uecsa_draft_v4');
  $bgCustom=null;$logo1=null;$logo2=null;$extraIds=[];$xCount=0;$subCounts={};$condC={1:0,2:0,3:0};$bgIdx=0;$ovIdx=0;
  buildSongsEditor();buildCondsEditor();
  document.querySelectorAll('.swatch').forEach((b,i)=>b.classList.toggle('on',i===0));
  document.querySelectorAll('.ov-swatch').forEach((s,i)=>s.classList.toggle('on',i===0));
  const or=document.getElementById('overlay-range');if(or){or.value=75;document.getElementById('overlay-lbl').textContent='75%';}
  const de=document.getElementById('p-date');if(de)de.value=new Date().toISOString().split('T')[0];
  ['p-occasion','p-season','p-time','p-venue','p-notes'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const db=DB.get(),s=db.settings;
  const setF=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v;};
  setF('p-tiktok',s.tiktok||'');setF('p-youtube',s.youtube||'');setF('p-phone',s.phone||'');setF('p-phone-role',s.phoneRole||'');setF('p-motto',s.motto||'KWA KUIMBA TWAENEZA INJILI');
  updatePosterLogos();renderPoster();toast('Imefutwa. Anza upya! 🆕');
}
