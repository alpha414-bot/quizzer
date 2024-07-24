// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import * as ENV from "../package.json";

const firebaseConfig = {
  apiKey: "AIzaSyANPBzk-DdXBvWWg-YOEydTlt-hdzUdme8",
  authDomain: "quizzer-x.firebaseapp.com",
  projectId: "quizzer-x",
  storageBucket: "quizzer-x.appspot.com",
  messagingSenderId: "192017495416",
  appId: "1:192017495416:web:f9344d338687e67f07048d",
  measurementId: "G-8DM7PDBLE1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
if (ENV.development) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export { app, auth, firestore, functions, storage };

