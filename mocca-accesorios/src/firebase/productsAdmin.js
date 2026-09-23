import { db } from './config.js';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export async function createProduct(codigo, data) {
  const ref = doc(db, 'products', codigo);
  await setDoc(ref, {
    ...data,
    codigo,
    activo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

export async function updateProduct(codigo, data) {
  const ref = doc(db, 'products', codigo);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

// "Eliminar" un producto lo archiva (activo:false) en vez de borrarlo de verdad:
// así no deja huecos en ventas históricas ni reportes futuros. Queda oculto
// del catálogo del vendedor pero se puede restaurar.
export async function archiveProduct(codigo) {
  await updateProduct(codigo, { activo: false });
}

export async function restoreProduct(codigo) {
  await updateProduct(codigo, { activo: true });
}
