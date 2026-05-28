'use strict';
const LOGO_UNI='data:image/png;base64,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￼￼
const LOGO_CSA='data:image/png;base64,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￼￼
const LOGO_CHOIR='data:image/png;base64,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￼￼

const OWNER={uid:'eph-owner',username:'Ephantus',name:'Ephantus',password:'m673',role:'owner',voice:'Conductor',phone:'0700117897',isOwner:true};
const INVITE_CODE='UECSA2026';

const MUSICAL_KEYS=['A mjr','Bb mjr','B mjr','C mjr','Db mjr','D mjr','Eb mjr','E mjr','F mjr','F# mjr','G mjr','Ab mjr','A min','Bb min','B min','C min','C# min','D min','Eb min','E min','F min','F# min','G min','G# min'];
const SONG_TYPES=['Ordinary Time / Kawaida','Advent / Majilio','Christmas / Krismasi','Lent / Kwaresima','Easter / Pasaka','Pentecost / Pentekoste','Marian / Bikira Maria','Communion / Ekaristi','Offertory / Sadaka','Processional / Kingilio','Recessional / Mwisho','Kyrie','Gloria / Utukufu','Sanctus / Mtakatifu','Agnus Dei / Mwanakondoo','Alleluya','Psalm / Zaburi','Praise & Worship','Traditional / Asili','Wedding / Harusi','Funeral / Mazishi'];
const FIXED_SONGS=[{id:'kiingilio',lbl:'Kiingilio'},{id:'misa',lbl:'Misa'},{id:'injili',lbl:'Injili'},{id:'utukufu',lbl:'Utukufu na Sifa'},{id:'zaburi',lbl:'Zaburi'},{id:'sadaka',lbl:'Sadaka'},{id:'matega',lbl:'Matega'},{id:'mtakatifu',lbl:'Mtakatifu'},{id:'kondoo',lbl:'Mwanakondoo'},{id:'ekaristi',lbl:'Ekaristia'},{id:'shukrani',lbl:'Shukrani'},{id:'mwisho',lbl:'Mwisho'}];
const BG_PRESETS=[{n:'Passion',bg:'linear-gradient(155deg,#12000a,#3a0015 40%,#12000a)',ic:'🔥'},{n:'Thorns',bg:'linear-gradient(155deg,#040404,#160606 40%,#040404)',ic:'✝'},{n:'Vigil',bg:'linear-gradient(155deg,#06040c,#14081e 40%,#06040c)',ic:'🕯'},{n:'Night',bg:'linear-gradient(155deg,#02020c,#060618 40%,#02020c)',ic:'🌃'},{n:'Deep',bg:'linear-gradient(155deg,#020c1a,#041a30 40%,#020c1a)',ic:'🌊'},{n:'Ember',bg:'linear-gradient(155deg,#180400,#4a1000 40%,#180400)',ic:'🌋'},{n:'Forest',bg:'linear-gradient(155deg,#010c03,#041a08 40%,#010c03)',ic:'🌿'},{n:'Dawn',bg:'linear-gradient(155deg,#100208,#380608 40%,#100208)',ic:'🌅'}];
const OVERLAY_OPTS=[{n:'Black',v:'rgba(0,0,0,'},{n:'Navy',v:'rgba(3,6,18,'},{n:'Crimson',v:'rgba(50,0,0,'},{n:'Violet',v:'rgba(16,0,40,'},{n:'Sepia',v:'rgba(24,10,0,'},{n:'Forest',v:'rgba(0,12,4,'},{n:'Teal',v:'rgba(0,16,24,'},{n:'Clear',v:'rgba(240,240,255,'}];
const SEASON_COL={'Majilio':{occ:'#ce93d8',bar:'#9c27b0'},'Advent':{occ:'#ce93d8',bar:'#9c27b0'},'Krismasi':{occ:'#ef9a9a',bar:'#c62828'},'Christmas':{occ:'#ef9a9a',bar:'#c62828'},'Kwaresima':{occ:'#bcaaa4',bar:'#795548'},'Lent':{occ:'#bcaaa4',bar:'#795548'},'Pasaka':{occ:'#fff176',bar:'#f9a825'},'Easter':{occ:'#fff176',bar:'#f9a825'},'Pentekoste':{occ:'#ef9a9a',bar:'#e53935'},'default':{occ:'#00e5ff',bar:'#0097a7'}};

/* ── AI ── */
const AI={K:'uecsa_ai_v4',d:{keys:{},songs:{},secKeys:{},seasKeys:{},total:0},
  load(){try{const r=localStorage.getItem(this.K);if(r)this.d={...this.d,...JSON.parse(r)};}catch(e){}},
  save(){try{localStorage.setItem(this.K,JSON.stringify(this.d));}catch(e){}},
  trackKey(k,sec,sea){if(!k)return;this.d.keys[k]=(this.d.keys[k]||0)+1;if(sec)this.d.secKeys[sec]=k;if(sea){if(!this.d.seasKeys[sea])this.d.seasKeys[sea]={};this.d.seasKeys[sea][k]=(this.d.seasKeys[sea][k]||0)+1;}this.d.total++;this.save();},
  trackSong(n){if(!n||n.length<2)return;const k=n.toLowerCase().slice(0,5);if(!this.d.songs[k])this.d.songs[k]=[];const ex=this.d.songs[k].find(x=>x.n===n);if(ex)ex.c++;else this.d.songs[k].push({n,c:1});this.save();},
  suggestKeys(sec,sea,n=6){const s=new Set();if(sec&&this.d.secKeys[sec])s.add(this.d.secKeys[sec]);if(sea&&this.d.seasKeys[sea])Object.entries(this.d.seasKeys[sea]).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([k])=>s.add(k));Object.entries(this.d.keys).sort((a,b)=>b[1]-a[1]).slice(0,6).forEach(([k])=>s.add(k));['G mjr','D mjr','C mjr','A mjr','Bb mjr','F mjr'].forEach(k=>s.add(k));return[...s].slice(0,n);},
};

/* ── DB ── */
// Hybrid DB - tries cloud first, falls back to local
import CloudDB from './firebase-db.js';

const HybridDB = {
  _cache: null,
  _cloudEnabled: true,
  
  async init() {
    try {
      // Try to load from cloud
      this._cache = {
        directors: await CloudDB.getDirectors(),
        scores: await CloudDB.getScores(),
        announcements: await CloudDB.getAnnouncements(),
        massOrders: [],
        groupChat: [],
        dms: {},
        activity: []
      };
      this._cloudEnabled = true;
      console.log("☁️ Using cloud database");
    } catch (e) {
      console.warn("Cloud unavailable, using local storage:", e);
      this._cloudEnabled = false;
      this._cache = JSON.parse(localStorage.getItem('uecsa_db_v4') || '{}');
    }
    return this._cache;
  },
  
  async get() {
    if (!this._cache) await this.init();
    return this._cache;
  },
  
  async update(fn) {
    const data = await this.get();
    fn(data);
    
    if (this._cloudEnabled) {
      // Save to cloud
      try {
        if (data.announcements) {
          for (const ann of data.announcements) {
            if (!ann._synced) {
              await CloudDB.addAnnouncement(ann);
              ann._synced = true;
            }
          }
        }
        if (data.scores) {
          for (const score of data.scores) {
            if (!score._synced) {
              await CloudDB.addScore(score);
              score._synced = true;
            }
          }
        }
      } catch (e) {
        console.warn("Cloud save failed:", e);
      }
    }
    
    // Always save to local as backup
    localStorage.setItem('uecsa_db_v4', JSON.stringify(data));
    return data;
  }
};

// Replace the old DB with HybridDB
window.DB = HybridDB;

/* ── SESSION ── */
function saveSession(user){try{localStorage.setItem('uecsa_sess_v4',JSON.stringify({uid:user.uid,ts:Date.now()}));}catch(e){}}
function clearSession(){localStorage.removeItem('uecsa_sess_v4');}
function getSession(){
  try{const s=JSON.parse(localStorage.getItem('uecsa_sess_v4')||'null');if(!s)return null;
    if(s.uid===OWNER.uid)return Object.assign({},OWNER);
    const db=DB.get();return db.directors.find(d=>d.uid===s.uid)||null;}
  catch(e){return null;}
}
function requireAuth(){const u=getSession();if(!u){window.location.href='index.html';return null;}return u;}

/* ── UTILS ── */
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const ini=n=>(n||'').trim().split(/\s+/).map(w=>w[0]||'').join('').slice(0,2).toUpperCase()||'?';
const $=id=>document.getElementById(id);
const $$=s=>document.querySelectorAll(s);
const txt=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
const htm=(id,v)=>{const e=$(id);if(e)e.innerHTML=v;};
const show=id=>{const e=$(id);if(e)e.style.display='';};
const hide=id=>{const e=$(id);if(e)e.style.display='none';};
const getVal=id=>$(id)?$(id).value:'';
const setVal=(id,v)=>{const e=$(id);if(e)e.value=v;};
let _tt;
function toast(msg,type,dur){type=type||'ok';dur=dur||3200;const el=$('toast');if(!el)return;el.textContent=msg;el.className='show '+type;clearTimeout(_tt);_tt=setTimeout(()=>el.className='',dur);}
function togglePw(id,btn){const e=$(id);if(!e)return;e.type=e.type==='password'?'text':'password';btn.textContent=e.type==='password'?'👁':'🙈';}
function openModal(id){const e=$(id);if(e)e.classList.add('open');}
function closeModal(id){const e=$(id);if(e)e.classList.remove('open');}
function roleName(r){return({owner:'Mmiliki',chief:'Msimamizi Mkuu',deputy:'Naibu',director:'Msimamizi',organist:'Mpiga Ogani',conductor:'Kondakta'})[r]||r||'—';}
function fmtDate(ts){if(!ts)return'—';return new Date(ts).toLocaleDateString('sw-KE',{dateStyle:'medium'});}
function fmtTime(ts){if(!ts)return'';return new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
function timeAgo(ts){if(!ts)return'';const s=(Date.now()-ts)/1000;if(s<60)return'sasa hivi';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';return fmtDate(ts);}
document.addEventListener('click',e=>{if(e.target.classList.contains('modal-bg'))e.target.classList.remove('open');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal-bg.open').forEach(m=>m.classList.remove('open'));});

/* ── TOPBAR ── */
function buildTopbar(page){
  const u=getSession();if(!u)return;
  const av=$('tb-av');if(av)av.textContent=ini(u.name);
  txt('tb-uname',u.name);txt('tb-urole',roleName(u.role));
  const lg=$('tb-logo-img');if(lg)lg.src=LOGO_CSA;
  $$('.nav-btn').forEach(b=>b.classList.toggle('on',b.dataset.page===page));
  const isLead=u.isOwner||['owner','chief','deputy'].includes(u.role);
  if(isLead){show('owner-fab');const aa=$('ann-actions');if(aa)aa.style.display='flex';}
  else{const aa=$('ann-actions');if(aa)aa.style.display='none';}
}
function doLogout(){const u=getSession();if(u)DB.log(u.name+' ametoka','👋');clearSession();window.location.href='index.html';}
function toggleNotifPanel(){const p=$('notif-panel');if(p){p.classList.toggle('open');renderNotifs();}}
function renderNotifs(){const db=DB.get();const el=$('notif-list');if(!el)return;const items=db.announcements.slice(0,6);el.innerHTML=items.length?items.map(a=>`<div class="np-item" onclick="location.href='announcements.html'">📢 <strong>${esc(a.title)}</strong><div style="font-size:11px;color:var(--muted)">${timeAgo(a.createdAt)}</div></div>`).join(''):'<p class="np-empty">Hakuna arifa mpya.</p>';}
function clearNotifs(){htm('notif-list','<p class="np-empty">Zote zimesomwa.</p>');}


// Add at the end of shared.js

// Firebase sync functions
async function syncToFirebase(collectionName, data) {
  try {
    const { db, collection, addDoc, setDoc, doc } = await import('./firebase-config.js');
    const colRef = collection(db, collectionName);
    await addDoc(colRef, { ...data, syncedAt: Date.now() });
    return true;
  } catch (e) {
    console.warn("Firebase sync failed:", e);
    return false;
  }
}

async function syncLocalToFirebase() {
  const db = DB.get();
  const u = getSession();
  if (!u) return;
  
  // Sync announcements to Firebase
  for (const ann of db.announcements) {
    if (!ann.synced) {
      await syncToFirebase('announcements', ann);
      ann.synced = true;
    }
  }
  
  // Sync scores to Firebase
  for (const score of db.scores) {
    if (!score.synced) {
      await syncToFirebase('scores', score);
      score.synced = true;
    }
  }
  
  DB.set(db);
}

// Call this every 5 minutes
setInterval(() => {
  if (getSession()) syncLocalToFirebase();
}, 300000);
