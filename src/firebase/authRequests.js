import { db } from './config.js';
import { collection, doc, addDoc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';

export async function crearSolicitudAnulacion({ venta, vendedorId, vendedorNombre, motivo }) {
  await addDoc(collection(db, 'authRequests'), {
    tipo: 'anulacion',
    ventaId: venta.id,
    ventaTotal: venta.total,
    ventaFecha: venta.fecha,
    vendedorId,
    vendedorNombre,
    detalle: motivo,
    estado: 'pendiente',
    createdAt: new Date().toISOString()
  });
}

export function subscribePendingRequests(callback) {
  const q = query(collection(db, 'authRequests'), where('estado', '==', 'pendiente'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function rechazarSolicitud(requestId) {
  await updateDoc(doc(db, 'authRequests', requestId), {
    estado: 'rechazada',
    resolvedAt: new Date().toISOString()
  });
}

export async function marcarSolicitudAprobada(requestId) {
  await updateDoc(doc(db, 'authRequests', requestId), {
    estado: 'aprobada',
    resolvedAt: new Date().toISOString()
  });
}
