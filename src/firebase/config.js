
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0lCChcBlSI-68AhYQEJiF55YmND8eX0U",
  authDomain: "petsuam-7ed3a.firebaseapp.com",
  projectId: "petsuam-7ed3a",
  storageBucket: "petsuam-7ed3a.firebasestorage.app",
  messagingSenderId: "258004051450",
  appId: "1:258004051450:web:5c6a3f7afc0b99c97b3043",
  measurementId: "G-TXV72MWN9M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);