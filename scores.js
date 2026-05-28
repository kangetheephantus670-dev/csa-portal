'use strict';
let $pdf=null;

document.addEventListener('DOMContentLoaded',()=>{
  const u=requireAuth();if(!u)return;
  buildTopbar('scores');populateSelects();filterScores();
});

function populateSelects(){
  ['sc-key','scores-key-filter'].forEach(id=>{const el=document.getElementById(id);if(el&&el.options.length<=1)MUSICAL_KEYS.forEach(k=>{const o=document.createElement('option');o.value=o.textContent=k;el.appendChild(o);});});
  ['sc-type','scores-type-filter'].forEach(id=>{const el=document.getElementById(id);if(el&&el.options.length<=1)SONG_TYPES.forEach(t=>{const o=document.createElement('option');o.value=o.textContent=t;el.appendChild(o);});});
}

function filterScores(){
  const q=(document.getElementById('scores-search')||{value:''}).value.toLowerCase();
  const key=(document.getElementById('scores-key-filter')||{value:''}).value;
  const type=(document.getElementById('scores-type-filter')||{value:''}).value;
  const srt=(document.getElementById('scores-sort')||{value:'new'}).value;
  const db=DB.get();let scores=[...db.scores];
  if(q)scores=scores.filter(s=>(s.title||'').toLowerCase().includes(q)||(s.author||'').toLowerCase().includes(q)||(s.key||'').toLowerCase().includes(q)||(s.type||'').toLowerCase().includes(q));
  if(key)scores=scores.filter(s=>s.key===key);
  if(type)scores=scores.filter(s=>s.type===type);
  if(srt==='az')scores.sort((a,b)=>(a.title||'').localeCompare(b.title||''));
  else if(srt==='used')scores.sort((a,b)=>(b.usedCount||0)-(a.usedCount||0));
  else scores.sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
  const cc=document.getElementById('scores-count');if(cc)cc.textContent=scores.length+' wimbo';
  const el=document.getElementById('scores-grid');if(!el)return;
  if(!scores.length){el.innerHTML='<div class="empty" style="grid-column:1/-1"><span class="ei">🎵</span><p>Hakuna nyimbo. Bonyeza <strong>+ Ongeza</strong>!</p></div>';return;}
  el.innerHTML=scores.map((x,i)=>`
    <div class="score-card" style="animation-delay:${i*.04}s" onclick="viewScore('${x.id}')">
      <div class="score-badges"><span class="key-badge">${esc(x.key)}</span><span class="type-badge">${esc(x.type)}</span></div>
      <div class="score-title">${esc(x.title)}</div>
      <div class="score-author">na ${esc(x.author)}</div>
      ${x.notes?'<div class="score-notes">'+esc(x.notes)+'</div>':''}
      <div class="score-footer">
        <span class="score-by">↑ ${esc(x.addedBy||'—')}</span>
        ${x.pdfData?'<button class="btn btn-blue btn-xs" onclick="event.stopPropagation();openScorePdf(\''+x.id+'\')">📄 PDF</button>':''}
      </div>
    </div>`).join('');
}

function viewScore(id){
  const db=DB.get();const s=db.scores.find(x=>x.id===id);if(!s)return;
  DB.update(d=>{const sc=d.scores.find(x=>x.id===id);if(sc)sc.usedCount=(sc.usedCount||0)+1;});
  const u=getSession();const isLead=u&&(u.isOwner||['owner','chief','deputy'].includes(u.role));
  const el=document.getElementById('view-score-title');if(el)el.textContent=s.title;
  const body=document.getElementById('view-score-body');
  if(body)body.innerHTML=`
    <div style="display:flex;gap:8px;margin-bottom:14px;">
      <span class="key-badge" style="font-size:12px;padding:4px 12px;">${esc(s.key)}</span>
      <span class="type-badge" style="font-size:12px;padding:4px 12px;">${esc(s.type)}</span>
    </div>
    <div style="font-size:14px;margin-bottom:6px;"><strong>Mtunzi:</strong> ${esc(s.author)}</div>
    ${s.notes?'<div style="color:var(--muted);font-size:13px;margin-bottom:10px;">'+esc(s.notes)+'</div>':''}
    <div style="font-size:12px;color:var(--muted);margin-bottom:14px;">Iliongezwa na <strong>${esc(s.addedBy||'—')}</strong> · ${fmtDate(s.addedAt)}<br/>Imetumika: <strong>${s.usedCount||0}</strong> mara</div>
    ${s.pdfData?'<button class="btn btn-blue" style="margin-bottom:12px;" onclick="openScorePdf(\''+s.id+'\')">📄 Fungua PDF</button>':''}
    ${isLead?'<button class="btn btn-danger btn-sm" style="margin-left:8px;" onclick="delScore(\''+s.id+'\');closeModal(\'modal-view-score\')">🗑️ Futa</button>':''}
    ${s.pdfData?'<div style="margin-top:12px;"><iframe src="'+s.pdfData+'" style="width:100%;height:380px;border:1px solid var(--border);border-radius:var(--r);"></iframe></div>':''}`;
  openModal('modal-view-score');
}
function openScorePdf(id){const db=DB.get();const s=db.scores.find(x=>x.id===id);if(!s||!s.pdfData)return;const w=window.open('','_blank');if(w)w.document.write('<html><body style="margin:0;background:#000"><iframe src="'+s.pdfData+'" style="width:100%;height:100vh;border:none"></iframe></body></html>');}
function delScore(id){DB.update(d=>{d.scores=d.scores.filter(x=>x.id!==id);});DB.log('Wimbo umefutwa','🗑️');toast('Wimbo umefutwa.','info');filterScores();}
function onScorePdfDrop(e){e.preventDefault();document.getElementById('score-dz').classList.remove('over');const f=e.dataTransfer.files[0];if(f&&f.type==='application/pdf'){$pdf=f;const l=document.getElementById('score-pdf-lbl');if(l)l.textContent='✓ '+f.name;}}
function onScorePdfFile(inp){if(inp.files[0]){$pdf=inp.files[0];const l=document.getElementById('score-pdf-lbl');if(l)l.textContent='✓ '+inp.files[0].name;}}
async function doAddScore(){
  const title=(document.getElementById('sc-title')||{value:''}).value.trim();
  const author=(document.getElementById('sc-author')||{value:''}).value.trim();
  const key=(document.getElementById('sc-key')||{value:''}).value;
  const type=(document.getElementById('sc-type')||{value:''}).value;
  const notes=(document.getElementById('sc-notes')||{value:''}).value.trim();
  const err=document.getElementById('score-err');const btn=document.getElementById('btn-score');
  if(err)err.textContent='';
  if(!title)return err&&(err.textContent='Weka jina la wimbo.');
  if(!author)return err&&(err.textContent='Weka jina la mtunzi.');
  if(!key)return err&&(err.textContent='Chagua ufunguo.');
  if(!type)return err&&(err.textContent='Chagua aina ya wimbo.');
  if(btn){btn.disabled=true;btn.textContent='Inahifadhi...';}
  let pdfData=null;
  if($pdf)pdfData=await new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsDataURL($pdf);});
  const score={id:'sc_'+Date.now(),title,author,key,type,notes,pdfData,addedBy:getSession().name,addedAt:Date.now(),usedCount:0};
  DB.update(d=>d.scores.unshift(score));
  AI.trackKey(key,'library','');populateSelects();
  closeModal('modal-add-score');
  ['sc-title','sc-author','sc-notes'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const ek=document.getElementById('sc-key');if(ek)ek.value='';
  const et=document.getElementById('sc-type');if(et)et.value='';
  const sl=document.getElementById('score-pdf-lbl');if(sl)sl.textContent='';$pdf=null;
  if(btn){btn.disabled=false;btn.textContent='Hifadhi Wimbo';}
  DB.log(getSession().name+' aliongeza wimbo: "'+title+'"','🎵');
  toast('Wimbo "'+title+'" umehifadhiwa! 🎵');filterScores();
}
function exportScores(){
  const db=DB.get();
  const rows=[['Jina','Mtunzi','Ufunguo','Aina','Maelezo','Iliongezwa na','Tarehe','Imetumika']];
  db.scores.forEach(s=>rows.push([s.title,s.author,s.key,s.type,s.notes||'',s.addedBy,fmtDate(s.addedAt),s.usedCount||0]));
  const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download='UECSA_Nyimbo_'+new Date().toLocaleDateString().replace(/\//g,'-')+'.csv';a.click();
  toast('Orodha imepakiwa! ⬇️');
}

let firebaseStorage = null;

async function uploadPDFToFirebase(file, scoreId) {
  try {
    const { storage, ref, uploadBytes, getDownloadURL } = await import('./firebase-config.js');
    const storageRef = ref(storage, `scores/${scoreId}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (e) {
    console.warn("Firebase upload failed:", e);
    return null;
  }
}

// Update doAddScore function
async function doAddScore() {
  const title = (document.getElementById('sc-title') || { value: '' }).value.trim();
  const author = (document.getElementById('sc-author') || { value: '' }).value.trim();
  const key = (document.getElementById('sc-key') || { value: '' }).value;
  const type = (document.getElementById('sc-type') || { value: '' }).value;
  const notes = (document.getElementById('sc-notes') || { value: '' }).value.trim();
  const err = document.getElementById('score-err');
  const btn = document.getElementById('btn-score');
  
  if (err) err.textContent = '';
  if (!title) return err && (err.textContent = 'Weka jina la wimbo.');
  if (!author) return err && (err.textContent = 'Weka jina la mtunzi.');
  if (!key) return err && (err.textContent = 'Chagua ufunguo.');
  if (!type) return err && (err.textContent = 'Chagua aina ya wimbo.');
  if (btn) { btn.disabled = true; btn.textContent = 'Inahifadhi...'; }
  
  const scoreId = 'sc_' + Date.now();
  let pdfUrl = null;
  
  if ($pdf) {
    pdfUrl = await uploadPDFToFirebase($pdf, scoreId);
  }
  
  const score = {
    id: scoreId,
    title, author, key, type, notes,
    pdfUrl: pdfUrl,
    addedBy: getSession().name,
    addedAt: Date.now(),
    usedCount: 0
  };
  
  DB.update(d => d.scores.unshift(score));
  
  // Try to sync to Firestore
  try {
    const { db, collection, addDoc } = await import('./firebase-config.js');
    await addDoc(collection(db, "scores"), score);
    console.log("Score synced to Firebase");
  } catch (e) {
    console.warn("Firestore sync failed:", e);
  }
  
  closeModal('modal-add-score');
  ['sc-title', 'sc-author', 'sc-notes'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.value = '';
  });
  const ek = document.getElementById('sc-key'); if (ek) ek.value = '';
  const et = document.getElementById('sc-type'); if (et) et.value = '';
  const sl = document.getElementById('score-pdf-lbl'); if (sl) sl.textContent = '';
  $pdf = null;
  if (btn) { btn.disabled = false; btn.textContent = 'Hifadhi Wimbo'; }
  DB.log(getSession().name + ' aliongeza wimbo: "' + title + '"', '🎵');
  toast('Wimbo "' + title + '" umehifadhiwa! 🎵');
  filterScores();
}
