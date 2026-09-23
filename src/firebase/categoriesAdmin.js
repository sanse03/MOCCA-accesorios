import { db } from './config.js';
import { doc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createCategory(nombre) {
  const id = slugify(nombre);
  const prefijo = nombre.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'CAT';
  await setDoc(doc(db, 'categories', id), { nombre, prefijo, activo: true });
  return { id, nombre, prefijo };
}

export async function renameCategory(id, nombre) {
  await updateDoc(doc(db, 'categories', id), { nombre });
}

export async function countActiveProductsInCategory(categoriaId) {
  const q = query(collection(db, 'products'), where('categoriaId', '==', categoriaId));
  const snap = await getDocs(q);
  let count = 0;
  snap.forEach((d) => {
    if (d.data().activo !== false) count++;
  });
  return count;
}

// Bloquea el borrado si la categoría todavía tiene productos activos,
// tal como se definió para la app: hay que reasignarlos o archivarlos antes.
export async function deleteCategory(id) {
  const count = await countActiveProductsInCategory(id);
  if (count > 0) {
    const err = new Error(
      `Esta categoría tiene ${count} producto${count === 1 ? '' : 's'} activo${count === 1 ? '' : 's'}. Reasígnalos o archívalos antes de borrarla.`
    );
    err.code = 'category-has-products';
    throw err;
  }
  await deleteDoc(doc(db, 'categories', id));
}
