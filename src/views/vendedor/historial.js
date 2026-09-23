import { subscribeSales } from '../../firebase/sales.js';
import { formatCOP } from '../../components/productCard.js';

let unsubscribe = null;

const CANAL_LABEL = { tienda: 'Tienda', whatsapp: 'WhatsApp' };
const METODO_LABEL = { efectivo: 'Efectivo', nequi: 'Nequi', bancolombia: 'Bancolombia' };

export function renderHistorial(container) {
  container.innerHTML = `
    <div class="carrito-screen">
      <h1 class="catalogo-title">Historial</h1>
      <div id="historial-body">
        <p class="loading">Cargando ventas...</p>
      </div>
    </div>
  `;

  if (unsubscribe) unsubscribe();
  unsubscribe = subscribeSales((ventas) => renderList(container, ventas));
}

function renderList(container, ventas) {
  const body = container.querySelector('#historial-body');
  if (!body) return;

  if (ventas.length === 0) {
    body.innerHTML = `<p class="empty-state">Todavía no hay ventas registradas.</p>`;
    return;
  }

  body.innerHTML = `
    <ul class="sale-list">
      ${ventas.map((v) => saleRow(v)).join('')}
    </ul>
  `;

  body.querySelectorAll('.sale-row').forEach((row) => {
    row.addEventListener('click', () => {
      row.classList.toggle('is-expanded');
    });
  });
}

function saleRow(venta) {
  const fecha = venta.fecha ? new Date(venta.fecha) : null;
  const fechaTxt = fecha
    ? fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) + ' · ' +
      fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : '';
  const metodosTxt = (venta.pagos || []).map((p) => METODO_LABEL[p.metodo] || p.metodo).join(' + ');
  const cantidadItems = (venta.items || []).reduce((s, i) => s + i.cantidad, 0);

  return `
    <li class="sale-row">
      <div class="sale-row-main">
        <div>
          <p class="sale-row-date">${fechaTxt}</p>
          <p class="sale-row-meta">${venta.vendedorNombre || ''} · ${CANAL_LABEL[venta.canal] || venta.canal} · ${cantidadItems} art.</p>
        </div>
        <p class="sale-row-total">${formatCOP(venta.total)}</p>
      </div>
      <div class="sale-row-detail">
        <p class="sale-row-metodos">${metodosTxt}</p>
        <ul class="sale-row-items">
          ${(venta.items || []).map((i) => `
            <li>${i.cantidad} × ${i.nombre} — ${formatCOP(i.subtotal)}</li>
          `).join('')}
        </ul>
      </div>
    </li>
  `;
}

export function stopHistorial() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
