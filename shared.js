'use strict';
// ... (keep all your const definitions: LOGO_UNI, LOGO_CSA, OWNER, INVITE_CODE, etc.)

/* ── AI ── */
const AI = { /* keep your existing AI object */ };

/* ── DB ── */
import CloudDB from './firebase-db.js';

const HybridDB = {
  _cache: null,
  _cloudEnabled: true,
  
  async init() {
    try {
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
    
    localStorage.setItem('uecsa_db_v4', JSON.stringify(data));
    return data;
  },
  
  // ✅ LOG FUNCTION - properly placed as a separate method
  async log(msg, ic) {
    const data = await this.get();
    const u = await getSession(); // ← MUST await here
    const logEntry = {
      msg: msg,
      ic: ic || '📌',
      by: u ? u.name : 'System',
      time: Date.now()
    };
    
    if (!data.activity) data.activity = [];
    data.activity.unshift(logEntry);
    if (data.activity.length > 150) data.activity.pop();
    
    if (this._cloudEnabled) {
      try {
        const { db, collection, addDoc } = await import('./firebase-config.js');
        await addDoc(collection(db, "activity"), logEntry);
      } catch(e) {}
    }
    
    localStorage.setItem('uecsa_db_v4', JSON.stringify(data));
  }
};

window.DB = HybridDB;

/* ── SESSION ── */
function saveSession(user) {
  try {
    localStorage.setItem('uecsa_sess_v4', JSON.stringify({uid: user.uid, ts: Date.now()}));
  } catch(e) {}
}

function clearSession() {
  localStorage.removeItem('uecsa_sess_v4');
}

// ✅ FIXED: Make getSession async
async function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem('uecsa_sess_v4') || 'null');
    if (!s) return null;
    if (s.uid === OWNER.uid) return Object.assign({}, OWNER);
    const db = await DB.get(); // ← MUST await here
    return db.directors?.find(d => d.uid === s.uid) || null;
  } catch(e) {
    return null;
  }
}

// ✅ FIXED: Make requireAuth async
async function requireAuth() {
  const u = await getSession(); // ← MUST await here
  if (!u) {
    window.location.href = 'index.html';
    return null;
  }
  return u;
}

/* ── UTILS ── */
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ini = n => (n || '').trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
const $ = id => document.getElementById(id);
const $$ = s => document.querySelectorAll(s);
const txt = (id, v) => { const e = $(id); if(e) e.textContent = v; };
const htm = (id, v) => { const e = $(id); if(e) e.innerHTML = v; };
const show = id => { const e = $(id); if(e) e.style.display = ''; };
const hide = id => { const e = $(id); if(e) e.style.display = 'none'; };
const getVal = id => $(id) ? $(id).value : '';
const setVal = (id, v) => { const e = $(id); if(e) e.value = v; };

let _tt;
function toast(msg, type, dur) {
  type = type || 'ok';
  dur = dur || 3200;
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'show ' + type;
  clearTimeout(_tt);
  _tt = setTimeout(() => el.className = '', dur);
}

function togglePw(id, btn) {
  const e = $(id);
  if (!e) return;
  e.type = e.type === 'password' ? 'text' : 'password';
  btn.textContent = e.type === 'password' ? '👁' : '🙈';
}

function openModal(id) { const e = $(id); if(e) e.classList.add('open'); }
function closeModal(id) { const e = $(id); if(e) e.classList.remove('open'); }

function roleName(r) {
  return ({ owner: 'Mmiliki', chief: 'Msimamizi Mkuu', deputy: 'Naibu', director: 'Msimamizi', organist: 'Mpiga Ogani', conductor: 'Kondakta' })[r] || r || '—';
}

function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('sw-KE', { dateStyle: 'medium' });
}

function fmtTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(ts) {
  if (!ts) return '';
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return 'sasa hivi';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return fmtDate(ts);
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-bg')) e.target.classList.remove('open');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $$('.modal-bg.open').forEach(m => m.classList.remove('open'));
});

/* ── TOPBAR ── */
async function buildTopbar(page) {  // ← MUST be async
  const u = await getSession();  // ← MUST await
  if (!u) return;
  const av = $('tb-av');
  if (av) av.textContent = ini(u.name);
  txt('tb-uname', u.name);
  txt('tb-urole', roleName(u.role));
  const lg = $('tb-logo-img');
  if (lg) lg.src = LOGO_CSA;
  $$('.nav-btn').forEach(b => b.classList.toggle('on', b.dataset.page === page));
  const isLead = u.isOwner || ['owner', 'chief', 'deputy'].includes(u.role);
  if (isLead) {
    show('owner-fab');
    const aa = $('ann-actions');
    if (aa) aa.style.display = 'flex';
  } else {
    const aa = $('ann-actions');
    if (aa) aa.style.display = 'none';
  }
}

async function doLogout() {
  const u = await getSession();
  if (u) await DB.log(u.name + ' ametoka', '👋');
  clearSession();
  window.location.href = 'index.html';
}

function toggleNotifPanel() {
  const p = $('notif-panel');
  if (p) {
    p.classList.toggle('open');
    renderNotifs();
  }
}

async function renderNotifs() {
  const db = await DB.get();
  const el = $('notif-list');
  if (!el) return;
  const items = db.announcements?.slice(0, 6) || [];
  el.innerHTML = items.length ? items.map(a => `<div class="np-item" onclick="location.href='announcements.html'">📢 <strong>${esc(a.title)}</strong><div style="font-size:11px;color:var(--muted)">${timeAgo(a.createdAt)}</div></div>`).join('') : '<p class="np-empty">Hakuna arifa mpya.</p>';
}

function clearNotifs() {
  htm('notif-list', '<p class="np-empty">Zote zimesomwa.</p>');
}

// Firebase sync functions
async function syncToFirebase(collectionName, data) {
  try {
    const { db, collection, addDoc } = await import('./firebase-config.js');
    const colRef = collection(db, collectionName);
    await addDoc(colRef, { ...data, syncedAt: Date.now() });
    return true;
  } catch (e) {
    console.warn("Firebase sync failed:", e);
    return false;
  }
}

async function syncLocalToFirebase() {
  const db = await DB.get();
  const u = await getSession();
  if (!u) return;
  
  for (const ann of db.announcements || []) {
    if (!ann.synced) {
      await syncToFirebase('announcements', ann);
      ann.synced = true;
    }
  }
  
  for (const score of db.scores || []) {
    if (!score.synced) {
      await syncToFirebase('scores', score);
      score.synced = true;
    }
  }
  
  localStorage.setItem('uecsa_db_v4', JSON.stringify(db));
}

setInterval(() => {
  getSession().then(u => {
    if (u) syncLocalToFirebase();
  });
}, 300000);
