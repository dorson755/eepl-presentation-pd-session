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

// Simple API for the presentation games to hook into
export const initVotingSession = async (sessionId, initialData) => {
  const ref = doc(db, 'sessions', sessionId);
  await setDoc(ref, initialData, { merge: true });
  return ref;
};

export const listenToVoting = (sessionId, callback) => {
  const ref = doc(db, 'sessions', sessionId);
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  });
};
