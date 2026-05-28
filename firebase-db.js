// firebase-db.js - Cloud-first database
import { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from './firebase-config.js';

// Collection references
const DIRECTORS_COL = collection(db, "directors");
const SCORES_COL = collection(db, "scores");
const ANNOUNCEMENTS_COL = collection(db, "announcements");
const MASSORDERS_COL = collection(db, "massOrders");
const MESSAGES_COL = collection(db, "messages");
const ACTIVITY_COL = collection(db, "activity");

// Cloud DB API
const CloudDB = {
  // Directors
  async getDirectors() {
    const snapshot = await getDocs(DIRECTORS_COL);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async addDirector(data) {
    return await addDoc(DIRECTORS_COL, { ...data, createdAt: Date.now() });
  },
  
  async updateDirector(id, data) {
    const ref = doc(db, "directors", id);
    await updateDoc(ref, data);
  },
  
  async deleteDirector(id) {
    const ref = doc(db, "directors", id);
    await deleteDoc(ref);
  },
  
  // Scores
  async getScores() {
    const snapshot = await getDocs(SCORES_COL);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async addScore(data) {
    return await addDoc(SCORES_COL, { ...data, createdAt: Date.now() });
  },
  
  // Announcements
  async getAnnouncements() {
    const q = query(ANNOUNCEMENTS_COL, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async addAnnouncement(data) {
    return await addDoc(ANNOUNCEMENTS_COL, { ...data, createdAt: Date.now() });
  },
  
  // Messages (real-time)
  subscribeMessages(callback) {
    const q = query(MESSAGES_COL, orderBy("timestamp", "asc"), limit(500));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    });
  },
  
  async sendMessage(data) {
    return await addDoc(MESSAGES_COL, { ...data, timestamp: Date.now() });
  },
  
  // Activity log
  async addActivity(msg, ic, by) {
    await addDoc(ACTIVITY_COL, { msg, ic, by, time: Date.now() });
  },
  
  // Sync local data to cloud
  async syncLocalToCloud() {
    const localDB = JSON.parse(localStorage.getItem('uecsa_db_v4') || '{}');
    
    // Sync directors
    if (localDB.directors) {
      for (const dir of localDB.directors) {
        const q = query(DIRECTORS_COL, where("username", "==", dir.username));
        const existing = await getDocs(q);
        if (existing.empty) {
          await addDoc(DIRECTORS_COL, dir);
        }
      }
    }
    
    // Sync scores
    if (localDB.scores) {
      for (const score of localDB.scores) {
        await addDoc(SCORES_COL, score);
      }
    }
    
    console.log("✅ Local data synced to cloud!");
    return true;
  }
};

export default CloudDB;
