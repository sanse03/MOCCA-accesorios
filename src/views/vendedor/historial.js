import { subscribeSales, anularVenta } from '../../firebase/sales.js';
import {
  subscribePendingRequests,
  crearSolicitudAnulacion,
  rechazarSolicitud,
  marcarSolicitudAprobada
} from '../../firebase/authRequests.js';
import { formatCOP } from '../../components/productCard.js';
import { openReasonPrompt } from '../../components/reasonPrompt.js';

let unsubscribeSales = null;
let unsubscribeRequests = null;
let ventas = [];
let solicitudes = [];
let isAdmin = false;
let currentUser = null;

const CANAL_LABEL = { tienda: 'Tienda', whatsapp: 'WhatsApp' };
const METODO_LABEL = { efectivo: 'Efectivo', nequi: 'Nequi', bancolombia: 'Bancolombia' };

export function renderHistorial(container, user, adminFlag) {
  currentUser = user;
  isAdmin = !!adminFlag;

  container.innerHTML = `
    <div class="carrito-screen">
      <h1 class="catalogo-title">Historial</h1>
      <div id="pending-requests"></div>
      <div id="historial-body">
        <p class="loading">Cargando ventas...</p>
      </div>
    </div>
    <div id="modal-root"></div>
  `;

  if (unsubscribeSales) unsubscribeSales();
  unsubscribeSales = subscribeSales((data) => {
    ventas = data;
    renderList(container);
  });

  if (unsubscribeRequests) unsubscribeRequests();
  unsubscribeRequests = subscribePendingRequests((data) => {
    solicitudes = data;
    renderList(container);
    if (isAdmin) renderPending(container);
  });
}

function renderPending(container) {
  const wrap = container.querySelector('#pending-requests');
  if (!wrap) return;

  if (solicitudes.length === 0) {
    wrap.innerHTML = '';
    return;
  }

  wrap.innerHTML = `
    <section class="pending-section">
      <h2 class="pending-title">Solicitudes de anulación pendientes</h2>
      ${solicitudes.map((s) => `
        <div class="pending-card" data-id="${s.id}">
          <p class="pending-meta">${s.vendedorNombre || ''} · ${formatCOP(s.ventaTotal)}</p>
          <p class="pending-motivo">"${s.detalle}"</p>
          <div class="pending-actions">
            <button type="button" class="btn btn-secondary pending-reject" data-id="${s.id}">Rechazar</button>
            <button type="button" class="btn btn-danger pending-approve" data-id="${s.id}">Aprobar y anular</button>
          </div>
        </div>
      `).join('')}
    </section>
  `;

  wrap.querySelectorAll('.pending-reject').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await rechazarSolicitud(btn.dataset.id);
    });
  });

  wrap.querySelectorAll('.pending-approve').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const solicitud = solicitudes.find((s) => s.id === btn.dataset.id);
      const venta = ventas.find((v) => v.id === solicitud?.ventaId);
      if (!solicitud || !venta) return;
      btn.disabled = true;
      try {
        await anularVenta({
          venta,
          motivo: solicitud.detalle,
          adminId: currentUser.uid,
          adminNombre: currentUser.perfil?.nombre || currentUser.email
        });
        await marcarSolicitudAprobada(solicitud.id);
      } catch (err) {
        alert(err.message || 'No se pudo anular la venta.');
        btn.disabled = false;
      }
    });
  });
}

function renderList(container) {
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
    row.addEventListener('click', (e) => {
      if (e.target.closest('.sale-action-btn')) return;
      row.classList.toggle('is-expanded');
    });
  });

  const modalRoot = container.querySelector('#modal-root');

  body.querySelectorAll('.sale-anular-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const venta = ventas.find((v) => v.id === btn.dataset.id);
      if (!venta) return;
      openReasonPrompt(modalRoot, {
        title: 'Anular venta',
        confirmLabel: 'Anular venta',
        onConfirm: (motivo) => anularVenta({
          venta,
          motivo,
          adminId: currentUser.uid,
          adminNombre: currentUser.perfil?.nombre || currentUser.email
        })
      });
    });
  });

  body.querySelectorAll('.sale-solicitar-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const venta = ventas.find((v) => v.id === btn.dataset.id);
      if (!venta) return;
      openReasonPrompt(modalRoot, {
        title: 'Solicitar anulación',
        confirmLabel: 'Enviar solicitud',
        onConfirm: (motivo) => crearSolicitudAnulacion({
          venta,
          vendedorId: currentUser.uid,
          vendedorNombre: currentUser.perfil?.nombre || currentUser.email,
          motivo
        })
      });
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
  const anulada = venta.estado === 'anulada';
  const pendiente = solicitudes.find((s) => s.ventaId === venta.id && s.estado === 'pendiente');

  let accionHtml = '';
  if (anulada) {
    accionHtml = `
      <div class="sale-anulada-box">
        <p class="sale-anulada-tag">Venta anulada</p>
        <p class="sale-anulada-motivo">"${venta.anulacion?.motivo || ''}" — ${venta.anulacion?.por || ''}</p>
      </div>
    `;
  } else if (pendiente) {
    accionHtml = `<p class="sale-pending-tag">Anulación solicitada — pendiente de aprobación</p>`;
  } else if (isAdmin) {
    accionHtml = `<button type="button" class="btn btn-danger sale-action-btn sale-anular-btn" data-id="${venta.id}">Anular venta</button>`;
  } else {
    accionHtml = `<button type="button" class="btn btn-secondary sale-action-btn sale-solicitar-btn" data-id="${venta.id}">Solicitar anulación</button>`;
  }

  return `
    <li class="sale-row ${anulada ? 'is-void' : ''}">
      <div class="sale-row-main">
        <div>
          <p class="sale-row-date">${fechaTxt}</p>
          <p class="sale-row-meta">${venta.vendedorNombre || ''} · ${CANAL_LABEL[venta.canal] || venta.canal} · ${cantidadItems} art.${venta.clienteNombre ? ` · Cliente: ${venta.clienteNombre}` : ''}</p>
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
        ${accionHtml}
      </div>
    </li>
  `;
}

export function stopHistorial() {
  if (unsubscribeSales) { unsubscribeSales(); unsubscribeSales = null; }
  if (unsubscribeRequests) { unsubscribeRequests(); unsubscribeRequests = null; }
}
