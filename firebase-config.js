// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion,
  deleteDoc,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEA5AgX_MSkxHe931kHNDnGoojyEF1s6A",
  authDomain: "uoecsa-choir.firebaseapp.com",
  projectId: "uoecsa-choir",
  storageBucket: "uoecsa-choir.firebasestorage.app",
  messagingSenderId: "191749483996",
  appId: "1:191749483996:web:41be78e05b5c33b42ef319",
  measurementId: "G-DQ7HTXSKC7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firestore Collection References
export const messagesRef = collection(db, "messages");
export const announcementsRef = collection(db, "announcements");
export const scoresRef = collection(db, "scores");
export const usersRef = collection(db, "users");
export const massOrdersRef = collection(db, "massOrders");
export const directorsRef = collection(db, "directors");

console.log("🔥 Firebase initialized successfully!");
