import { auth, db } from './config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

/**
 * Se suscribe a cambios de sesión. El callback recibe:
 * - null si no hay sesión iniciada
 * - { uid, email, perfil } si hay sesión, donde perfil = { nombre, rol, activo } desde /users/{uid}
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }
    const perfil = await getUserProfile(user.uid);
    callback({ uid: user.uid, email: user.email, perfil });
  });
}

export async function getUserProfile(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}
