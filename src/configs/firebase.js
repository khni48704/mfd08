import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, where } from "firebase/firestore";

// Din Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyClscgfC9_i8aC5rxCuPzWcvr_kwRbh_mY",
  authDomain: "mfd08-27cae.firebaseapp.com",
  projectId: "mfd08-27cae",
  storageBucket: "mfd08-27cae.appspot.com",
  messagingSenderId: "646530769493",
  appId: "1:646530769493:web:afbe3ba625b2e31079eadc"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Auth og Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Funktion til at oprette en journal entry
const createEntry = async (title, content) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Bruger ikke autentificeret');
    }

    const docRef = await addDoc(collection(db, "journalEntries"), {
      title: title,
      content: content,
      creationTime: serverTimestamp(),
      updatedTime: serverTimestamp(),
      ownerId: user.uid,
    });
    return docRef.id;
  } catch (e) {
    console.error("Fejl ved oprettelse af journal entry: ", e);
  }
};

// Funktion til at hente journal entries for en specifik bruger
const getEntries = async (userId) => {
  try {
    const q = query(collection(db, "journalEntries"), where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);
    let entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return entries;
  } catch (e) {
    console.error("Fejl ved hentning af journal entries: ", e);
  }
};

// Funktion til at opdatere en journal entry
const updateEntry = async (id, title, content) => {
  try {
    const entryRef = doc(db, "journalEntries", id);
    await updateDoc(entryRef, {
      title: title,
      content: content,
      updatedTime: serverTimestamp(),
    });
  } catch (e) {
    console.error("Fejl ved opdatering af journal entry: ", e);
  }
};

// Funktion til at slette en journal entry
const deleteEntry = async (id) => {
  try {
    await deleteDoc(doc(db, "journalEntries", id));
  } catch (e) {
    console.error("Fejl ved sletning af journal entry: ", e);
  }
};

// Eksporter funktionerne for brug i andre filer
export { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  doc, 
  getDoc, 
  setDoc, 
  createEntry, 
  getEntries, 
  updateEntry, 
  deleteEntry 
};
