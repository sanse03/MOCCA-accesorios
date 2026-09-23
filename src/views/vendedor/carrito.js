import {
  subscribeCart,
  getCartItems,
  getCartTotal,
  setQuantity,
  removeFromCart,
  clearCart
} from '../../utils/cartStore.js';
import { formatCOP } from '../../components/productCard.js';
import { registrarVenta } from '../../firebase/sales.js';
import { attachCurrencyInput, getCurrencyValue, setCurrencyValue } from '../../utils/formatInput.js';

const METODOS = [
  { id: 'efectivo', nombre: 'Efectivo' },
  { id: 'nequi', nombre: 'Nequi' },
  { id: 'bancolombia', nombre: 'Bancolombia' }
];

let unsubscribe = null;
let currentUser = null;

export function renderCarrito(container, user) {
  currentUser = user;

  container.innerHTML = `
    <div class="carrito-screen">
      <h1 class="catalogo-title">Carrito</h1>
      <div id="carrito-body"></div>
    </div>
    <div id="modal-root"></div>
  `;

  if (unsubscribe) unsubscribe();
  unsubscribe = subscribeCart((items) => renderBody(container, items));
}

function renderBody(container, items) {
  const body = container.querySelector('#carrito-body');
  if (!body) return;

  if (items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <p>Tu carrito está vacío.</p>
        <p class="cart-empty-hint">Ve al catálogo y toca el "+" de un producto para agregarlo.</p>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <ul class="cart-list">
      ${items.map((i) => `
        <li class="cart-item" data-codigo="${i.codigo}">
          <div class="cart-item-photo">
            ${i.foto ? `<img src="${i.foto}" alt="" />` : '<span class="cart-item-noimg">Sin foto</span>'}
          </div>
          <div class="cart-item-info">
            <p class="cart-item-name">${i.nombre}</p>
            <p class="cart-item-price">${formatCOP(i.precio)} c/u</p>
            <div class="cart-item-stepper">
              <button type="button" class="stepper-btn" data-action="dec" data-codigo="${i.codigo}">−</button>
              <span class="stepper-qty">${i.cantidad}</span>
              <button type="button" class="stepper-btn" data-action="inc" data-codigo="${i.codigo}" ${i.cantidad >= i.stockDisponible ? 'disabled' : ''}>+</button>
            </div>
          </div>
          <div class="cart-item-right">
            <p class="cart-item-subtotal">${formatCOP(i.precio * i.cantidad)}</p>
            <button type="button" class="cart-item-remove" data-codigo="${i.codigo}" aria-label="Quitar">&#10005;</button>
          </div>
        </li>
      `).join('')}
    </ul>
    <div class="cart-summary">
      <span>Total</span>
      <strong>${formatCOP(getCartTotal())}</strong>
    </div>
    <button type="button" class="btn btn-primary cart-checkout-btn" id="cart-checkout-btn">Confirmar venta</button>
  `;

  body.querySelectorAll('[data-action="inc"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = getCartItems().find((i) => i.codigo === btn.dataset.codigo);
      if (item) setQuantity(item.codigo, item.cantidad + 1);
    });
  });
  body.querySelectorAll('[data-action="dec"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = getCartItems().find((i) => i.codigo === btn.dataset.codigo);
      if (item) setQuantity(item.codigo, item.cantidad - 1);
    });
  });
  body.querySelectorAll('.cart-item-remove').forEach((btn) => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.codigo));
  });

  const checkoutBtn = body.querySelector('#cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => openCheckout(container));
  }
}

function openCheckout(container) {
  const modalRoot = container.querySelector('#modal-root');
  const items = getCartItems();
  const total = getCartTotal();
  let canal = 'tienda';
  const pagos = {}; // { metodoId: monto }

  modalRoot.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-sheet">
        <div class="modal-header">
          <h2>Confirmar venta</h2>
          <button type="button" class="modal-close" id="co-close">&#10005;</button>
        </div>
        <div class="modal-body">
          <p class="checkout-total">Total: <strong>${formatCOP(total)}</strong></p>

          <label for="co-cliente">Nombre del cliente (opcional)</label>
          <input type="text" id="co-cliente" placeholder="Ej. María Pérez" />

          <label>Canal</label>
          <div class="segmented" id="co-canal">
            <button type="button" class="segmented-btn is-active" data-canal="tienda">Tienda</button>
            <button type="button" class="segmented-btn" data-canal="whatsapp">WhatsApp</button>
          </div>

          <label>Método de pago</label>
          <div class="payment-methods" id="co-metodos">
            ${METODOS.map((m) => `
              <div class="payment-method" data-metodo="${m.id}">
                <button type="button" class="chip payment-toggle" data-metodo="${m.id}">${m.nombre}</button>
                <div class="input-prefix payment-amount-wrap" hidden>
                  <span>$</span>
                  <input type="text" inputmode="numeric" class="payment-amount" data-metodo="${m.id}" placeholder="0" />
                </div>
              </div>
            `).join('')}
          </div>
          <p class="checkout-remaining" id="co-remaining"></p>
          <p id="co-error" class="form-error" hidden></p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="co-cancel">Cancelar</button>
          <button type="button" class="btn btn-primary" id="co-confirm" disabled>Confirmar</button>
        </div>
      </div>
    </div>
  `;

  const close = () => { modalRoot.innerHTML = ''; };
  modalRoot.querySelector('#co-close').addEventListener('click', close);
  modalRoot.querySelector('#co-cancel').addEventListener('click', close);

  modalRoot.querySelectorAll('#co-canal .segmented-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      canal = btn.dataset.canal;
      modalRoot.querySelectorAll('#co-canal .segmented-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
    });
  });

  const remainingEl = modalRoot.querySelector('#co-remaining');
  const confirmBtn = modalRoot.querySelector('#co-confirm');

  function updateRemaining() {
    const asignado = Object.values(pagos).reduce((s, v) => s + (Number(v) || 0), 0);
    const falta = total - asignado;
    if (Object.keys(pagos).length === 0) {
      remainingEl.textContent = '';
    } else if (falta === 0) {
      remainingEl.textContent = 'Listo: el pago cubre el total.';
    } else if (falta > 0) {
      remainingEl.textContent = `Falta por asignar: ${formatCOP(falta)}`;
    } else {
      remainingEl.textContent = `Te pasaste por ${formatCOP(Math.abs(falta))}`;
    }
    confirmBtn.disabled = !(Object.keys(pagos).length > 0 && falta === 0);
  }

  modalRoot.querySelectorAll('.payment-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const metodo = btn.dataset.metodo;
      const wrap = modalRoot.querySelector(`.payment-method[data-metodo="${metodo}"] .payment-amount-wrap`);
      const amountInput = wrap.querySelector('.payment-amount');
      const active = btn.classList.toggle('is-active');
      if (active) {
        wrap.hidden = false;
        const asignado = Object.values(pagos).reduce((s, v) => s + (Number(v) || 0), 0);
        const restante = Math.max(0, total - asignado);
        setCurrencyValue(amountInput, restante);
        pagos[metodo] = restante;
      } else {
        wrap.hidden = true;
        amountInput.value = '';
        delete pagos[metodo];
      }
      updateRemaining();
    });
  });

  modalRoot.querySelectorAll('.payment-amount').forEach((input) => {
    attachCurrencyInput(input, (num) => {
      pagos[input.dataset.metodo] = num;
      updateRemaining();
    });
  });

  confirmBtn.addEventListener('click', async () => {
    const errorEl = modalRoot.querySelector('#co-error');
    errorEl.hidden = true;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Guardando...';

    try {
      await registrarVenta({
        items,
        canal,
        pagos: Object.entries(pagos).map(([metodo, monto]) => ({ metodo, monto })),
        clienteNombre: modalRoot.querySelector('#co-cliente').value.trim() || null,
        vendedorId: currentUser.uid,
        vendedorNombre: currentUser.perfil?.nombre || currentUser.email
      });
      clearCart();
      close();
    } catch (err) {
      errorEl.textContent = err.message || 'No se pudo registrar la venta.';
      errorEl.hidden = false;
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirmar';
    }
  });
}

export function stopCarrito() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
