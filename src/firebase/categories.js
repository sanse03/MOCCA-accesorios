import { db } from './config.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function getCategorias() {
  const q = query(collection(db, 'categories'), orderBy('nombre'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
