import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración real de tu proyecto de Firebase (mocca-accesorios).
// Esta información no es secreta (es normal que quede en el código del frontend);
// la seguridad real la dan las reglas de Firestore/Storage (firestore.rules, storage.rules).
const firebaseConfig = {
  apiKey: 'AIzaSyAnExjU70Lv1oxIZBcaDl6Uz7gkT51GdLw',
  authDomain: 'mocca-accesorios.firebaseapp.com',
  projectId: 'mocca-accesorios',
  storageBucket: 'mocca-accesorios.firebasestorage.app',
  messagingSenderId: '498250269043',
  appId: '1:498250269043:web:a1bed30f6ebdf114fac506'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
