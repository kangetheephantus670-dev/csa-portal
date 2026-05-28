'use strict';

let chatUnsubscribe = null;
let isFirebaseReady = false;
let firebaseModule = null;

async function initFirebaseChat() {
  try {
    firebaseModule = await import('./firebase-config.js');
    isFirebaseReady = true;
    console.log("Firebase chat ready!");
    renderMsgs();
  } catch (e) {
    console.warn("Firebase not available, using local storage:", e);
    renderMsgsLocal();
  }
}

async function renderMsgs() {
  if (!isFirebaseReady || !firebaseModule) {
    renderMsgsLocal();
    return;
  }
  
  if (chatUnsubscribe) chatUnsubscribe();
  
  const { db, collection, query, orderBy, onSnapshot } = firebaseModule;
  const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
  
  chatUnsubscribe = onSnapshot(q, (snapshot) => {
    const msgs = [];
    snapshot.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
    displayMessages(msgs);
  }, (error) => {
    console.error("Firebase error:", error);
    renderMsgsLocal();
  });
}

function renderMsgsLocal() {
  const u = getSession();
  const db = DB.get();
  const msgs = db.groupChat || [];
  displayMessages(msgs);
}

function displayMessages(msgs) {
  const u = getSession();
  const el = document.getElementById('chat-msgs');
  if (!el) return;
  
  if (!msgs.length) {
    el.innerHTML = '<div class="chat-empty">Hakuna ujumbe bado. Anza mazungumzo! 🎵</div>';
    return;
  }
  
  const atBot = el.scrollHeight - el.clientHeight - el.scrollTop < 30;
  
  el.innerHTML = msgs.map(m => {
    const out = m.uid === u?.uid;
    return `
      <div class="msg-wrap ${out ? 'out' : 'in'}">
        ${!out ? '<div class="msg-name">' + esc(m.name) + '</div>' : ''}
        <div class="msg-bubble ${out ? 'msg-out' : 'msg-in'}">${esc(m.text)}</div>
        <div class="msg-time">${fmtTime(m.ts || m.timestamp)}</div>
      </div>
    `;
  }).join('');
  
  if (atBot || msgs.length <= 20) el.scrollTop = el.scrollHeight;
}

async function sendMsg() {
  const u = getSession();
  const inp = document.getElementById('chat-inp');
  const text = inp?.value.trim();
  
  if (!text || !u) return;
  if (inp) inp.value = '';
  
  const msg = {
    uid: u.uid,
    name: u.name,
    text: text,
    timestamp: Date.now(),
    ts: Date.now()
  };
  
  // Try Firebase first
  if (isFirebaseReady && firebaseModule) {
    try {
      const { db, collection, addDoc } = firebaseModule;
      await addDoc(collection(db, "messages"), msg);
      console.log("Message sent to Firebase");
    } catch (e) {
      console.warn("Firebase send failed, saving locally:", e);
      saveMessageLocally(msg);
    }
  } else {
    saveMessageLocally(msg);
  }
}

function saveMessageLocally(msg) {
  DB.update(d => {
    if (!d.groupChat) d.groupChat = [];
    d.groupChat.push(msg);
    if (d.groupChat.length > 500) d.groupChat.shift();
  });
  renderMsgsLocal();
}

// Auto-refresh every 3 seconds as fallback
let refreshTimer;
function startRefreshTimer() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    if (!isFirebaseReady) renderMsgsLocal();
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  const u = requireAuth();
  if (!u) return;
  buildTopbar('chat');
  buildDMList();
  initFirebaseChat();
  startRefreshTimer();
});

// Keep existing buildDMList, showGroupChat, showDM functions from your original chat.js
