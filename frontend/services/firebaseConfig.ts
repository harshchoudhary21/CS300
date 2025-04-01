
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCu8djrs4jl4SKTO8x5lMirTt5yCumh6Yc",
  authDomain: "collegeapp-69816.firebaseapp.com",
  projectId: "collegeapp-69816",
  storageBucket: "collegeapp-69816.appspot.com", // Corrected to .appspot.com
  messagingSenderId: "263416040394",
  appId: "1:263416040394:web:ca1ed57261641161cc9d33"
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };