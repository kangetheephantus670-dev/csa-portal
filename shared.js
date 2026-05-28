'use strict';
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

    // Add this inside HybridDB object (after update function)
async log(msg, ic) {
  const data = await this.get();
  const u = getSession();
  const logEntry = {
    msg: msg,
    ic: ic || '📌',
    by: u ? u.name : 'System',
    time: Date.now()
  };
  
  if (!data.activity) data.activity = [];
  data.activity.unshift(logEntry);
  if (data.activity.length > 150) data.activity.pop();
  
  // Save to cloud if enabled
  if (this._cloudEnabled) {
    try {
      const { db, collection, addDoc } = await import('./firebase-config.js');
      await addDoc(collection(db, "activity"), logEntry);
    } catch(e) {}
  }
  
  // Always save locally
  localStorage.setItem('uecsa_db_v4', JSON.stringify(data));
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
