import { db } from './config.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

/**
 * Escucha el catálogo en tiempo real: cualquier cambio que haga el administrador
 * (precio, foto, stock, producto nuevo) llega al instante a esta suscripción,
 * sin que el vendedor tenga que recargar la página.
 * Devuelve una función para cancelar la suscripción.
 */
export function subscribeProductos(callback) {
  const q = query(collection(db, 'products'), orderBy('nombre'));
  return onSnapshot(q, (snap) => {
    const productos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(productos);
  });
}
