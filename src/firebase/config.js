import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBAjojdTiesufq-vWgYIuSl8BPwa64PQk",
  authDomain: "splitnest-9b676.firebaseapp.com",
  projectId: "splitnest-9b676",
  storageBucket: "splitnest-9b676.firebasestorage.app",
  messagingSenderId: "670083537211",
  appId: "1:670083537211:web:5e7cb7695ca17f62833f1e",
  measurementId: "G-3VXKZ991SK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;