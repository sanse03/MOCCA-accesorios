// Estado del carrito en memoria — una sola venta activa a la vez (como se definió).
// No persiste en Firestore hasta que se confirma la venta.
let items = [];
let listeners = [];

function notify() {
  listeners.forEach((fn) => fn(items));
}

export function subscribeCart(fn) {
  listeners.push(fn);
  fn(items);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getCartItems() {
  return items;
}

export function getCartCount() {
  return items.reduce((sum, i) => sum + i.cantidad, 0);
}

export function getCartTotal() {
  return items.reduce((sum, i) => sum + i.cantidad * i.precio, 0);
}

export function addToCart(producto) {
  const stockDisponible = producto.stock || 0;
  if (stockDisponible <= 0) return;

  const existing = items.find((i) => i.codigo === producto.codigo);
  if (existing) {
    if (existing.cantidad < stockDisponible) {
      existing.cantidad += 1;
    }
  } else {
    items.push({
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precio,
      categoriaId: producto.categoriaId,
      foto: producto.fotos?.[0]?.url || null,
      cantidad: 1,
      stockDisponible
    });
  }
  notify();
}

export function setQuantity(codigo, cantidad) {
  const item = items.find((i) => i.codigo === codigo);
  if (!item) return;
  if (cantidad <= 0) {
    items = items.filter((i) => i.codigo !== codigo);
  } else {
    item.cantidad = Math.min(cantidad, item.stockDisponible);
  }
  notify();
}

export function removeFromCart(codigo) {
  items = items.filter((i) => i.codigo !== codigo);
  notify();
}

export function clearCart() {
  items = [];
  notify();
}
