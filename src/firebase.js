// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSdVuJP65mqhaNse5vUZQKJIWVEZU1CKQ",
  authDomain: "classcard-f17bb.firebaseapp.com",
  projectId: "classcard-f17bb",
  storageBucket: "classcard-f17bb.appspot.com",
  messagingSenderId: "624989853213",
  appId: "1:624989853213:web:b0217da6c019bdbb4958f4",
  measurementId: "G-Y7SR8QTMCX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };