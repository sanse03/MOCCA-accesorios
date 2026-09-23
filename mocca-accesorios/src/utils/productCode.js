import { db } from '../firebase/config.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Calcula el siguiente código autogenerado para una categoría (ej. ARE-004),
 * buscando el correlativo más alto ya usado en esa categoría y sumando 1.
 * Usa el máximo en vez de contar documentos, para no repetir un código si
 * un producto de en medio fue archivado.
 */
export async function computeNextCode(categoriaId, prefijo) {
  const q = query(collection(db, 'products'), where('categoriaId', '==', categoriaId));
  const snap = await getDocs(q);
  let max = 0;
  snap.forEach((d) => {
    const match = d.id.match(/-(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  });
  const next = max + 1;
  return `${prefijo}-${String(next).padStart(3, '0')}`;
}
