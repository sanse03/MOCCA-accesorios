import { db } from './config.js';
import { collection, doc, runTransaction, query, orderBy, onSnapshot } from 'firebase/firestore';

/**
 * Registra una venta de forma segura: valida y descuenta el stock de cada
 * producto dentro de una transacción de Firestore, así que si dos
 * vendedores venden el mismo producto al mismo tiempo, nunca queda stock
 * negativo — el segundo en confirmar recibe un error claro en vez de
 * vender algo que ya no existe.
 */
export async function registrarVenta({ items, canal, pagos, vendedorId, vendedorNombre }) {
  if (!items || items.length === 0) {
    throw new Error('El carrito está vacío.');
  }

  const total = items.reduce((sum, i) => sum + i.cantidad * i.precio, 0);
  const saleRef = doc(collection(db, 'sales'));
  const productRefs = items.map((i) => doc(db, 'products', i.codigo));

  await runTransaction(db, async (tx) => {
    const snaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

    snaps.forEach((snap, idx) => {
      const item = items[idx];
      if (!snap.exists()) {
        throw new Error(`"${item.nombre}" ya no existe en el catálogo.`);
      }
      const stockActual = snap.data().stock ?? 0;
      if (stockActual < item.cantidad) {
        throw new Error(`Ya no hay suficiente stock de "${item.nombre}" (quedan ${stockActual}).`);
      }
    });

    snaps.forEach((snap, idx) => {
      const item = items[idx];
      const nuevoStock = (snap.data().stock ?? 0) - item.cantidad;
      tx.update(productRefs[idx], {
        stock: nuevoStock,
        estado: nuevoStock <= 0 ? 'agotado' : 'activo'
      });
    });

    tx.set(saleRef, {
      fecha: new Date().toISOString(),
      vendedorId,
      vendedorNombre,
      canal,
      items: items.map((i) => ({
        codigo: i.codigo,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precioUnitario: i.precio,
        subtotal: i.cantidad * i.precio
      })),
      pagos,
      total,
      estado: 'activa'
    });
  });

  return saleRef.id;
}

export function subscribeSales(callback) {
  const q = query(collection(db, 'sales'), orderBy('fecha', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
