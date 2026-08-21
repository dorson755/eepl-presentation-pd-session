import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "eepl-pd-session-live",
  appId: "1:474714355815:web:d506f75eba9e9874527cc2",
  storageBucket: "eepl-pd-session-live.firebasestorage.app",
  apiKey: "AIzaSyDeeLOZJNjLiRw09GHqjw-M0LOXqb51VSQ",
  authDomain: "eepl-pd-session-live.firebaseapp.com",
  messagingSenderId: "474714355815",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Set full session state (replaces document to avoid stale leftover keys)
export const updateSessionState = async (sessionId, data) => {
  const ref = doc(db, 'sessions', sessionId);
  await setDoc(ref, { ...data, updatedAt: Date.now() });
  return ref;
};

// Backward-compatible alias
export const initVotingSession = updateSessionState;

export const listenToVoting = (sessionId, callback) => {
  const ref = doc(db, 'sessions', sessionId);
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  });
};

