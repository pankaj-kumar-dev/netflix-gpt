import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyATpgyBauGpzXLL57SuRyn8usMiF37tM-8",
  authDomain: "netflixgpt-kithogun.firebaseapp.com",
  projectId: "netflixgpt-kithogun",
  storageBucket: "netflixgpt-kithogun.appspot.com",
  messagingSenderId: "38096141522",
  appId: "1:38096141522:web:0ced6b764a9ce1b29f010b",
  measurementId: "G-69F8XDGQMJ",
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();

