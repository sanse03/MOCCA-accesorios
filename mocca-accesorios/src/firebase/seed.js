import { db } from './config.js';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { categoriasSeed, productosSeed } from '../utils/seedData.js';

/**
 * Carga las categorías y productos iniciales (tomados de tus archivos Excel/CSV).
 * Es segura de ejecutar varias veces: nunca sobrescribe un producto o categoría
 * que ya exista (por eso no pisa el stock si ya hiciste ventas, ni las fotos
 * que ya hayas subido). Solo agrega lo que falte.
 */
export async function seedCatalogo() {
  const [catSnap, prodSnap] = await Promise.all([
    getDocs(collection(db, 'categories')),
    getDocs(collection(db, 'products'))
  ]);

  const catExistentes = new Set(catSnap.docs.map(d => d.id));
  const prodExistentes = new Set(prodSnap.docs.map(d => d.id));

  const batch = writeBatch(db);
  let nuevasCategorias = 0;
  let nuevosProductos = 0;

  categoriasSeed.forEach(cat => {
    if (!catExistentes.has(cat.id)) {
      batch.set(doc(db, 'categories', cat.id), {
        nombre: cat.nombre,
        prefijo: cat.prefijo,
        activo: true
      });
      nuevasCategorias++;
    }
  });

  productosSeed.forEach(p => {
    if (!prodExistentes.has(p.codigo)) {
      batch.set(doc(db, 'products', p.codigo), {
        codigo: p.codigo,
        nombre: p.nombre,
        categoriaId: p.categoriaId,
        precio: p.precio,
        stock: p.stock,
        estado: p.estado,
        fotos: p.fotos,
        activo: true,
        createdAt: new Date().toISOString()
      });
      nuevosProductos++;
    }
  });

  if (nuevasCategorias > 0 || nuevosProductos > 0) {
    await batch.commit();
  }

  return { nuevasCategorias, nuevosProductos };
}
