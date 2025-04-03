import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-8GZWA_m09kYYeec4SwP1xXV_Pffrbdg",
  authDomain: "weatherapp-10d01.firebaseapp.com",
  projectId: "weatherapp-10d01",
  storageBucket: "weatherapp-10d01.firebasestorage.app",
  messagingSenderId: "1051595898678",
  appId: "1:1051595898678:web:688126b3ae0f8cba077d97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app; 