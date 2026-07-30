import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// Configuración de Firebase (se lee de variables de entorno de Vite o se deja vacío para fallback local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Determinar si hay llaves válidas provistas
const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "TU_API_KEY";

let app;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);

    // Usar la API moderna de persistencia con soporte para múltiples pestañas
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });

    console.log("Firebase inicializado con éxito. Proyecto:", firebaseConfig.projectId);
  } catch (error) {
    console.error("Error crítico al inicializar Firebase:", error);
  }
} else {
  console.log("Modo de desarrollo local activo (sin Firebase conectado). Se usarán mocks integrados en localStorage.");
}

export { auth, db, isFirebaseConfigured };

