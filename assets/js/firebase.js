// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIK9AMXQz49gBRK3nnibdVTNj7nUJMm9U",
  authDomain: "vitalia-login.firebaseapp.com",
  projectId: "vitalia-login",
  storageBucket: "vitalia-login.appspot.com",
  messagingSenderId: "332486838318",
  appId: "1:332486838318:web:1261720a3eb736c505b7bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
