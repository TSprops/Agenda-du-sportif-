// Point d'entrée unique du SDK Firebase, empaqueté dans public/vendor/firebase.js (npm run build).
export { initializeApp } from "firebase/app";
export {
  getAuth, connectAuthEmulator, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, sendPasswordResetEmail, deleteUser,
  setPersistence, browserLocalPersistence, reauthenticateWithCredential, EmailAuthProvider
} from "firebase/auth";
export {
  initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot,
  query, where, orderBy, limit, serverTimestamp, writeBatch
} from "firebase/firestore";
