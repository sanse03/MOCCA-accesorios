import { subscribeProductos } from '../../firebase/products.js';
import { getCategorias } from '../../firebase/categories.js';
import { formatCOP } from '../../components/productCard.js';
import { openProductForm } from './productForm.js';

let unsubscribe = null;
let allProducts = [];
let categorias = [];

export async function renderInventario(container) {
  container.innerHTML = `
    <div class="carrito-screen">
      <h1 class="catalogo-title">Inventario</h1>
      <div id="inventario-body">
        <p class="loading">Cargando inventario...</p>
      </div>
    </div>
    <div id="modal-root"></div>
  `;

  try {
    categorias = await getCategorias();
  } catch (err) {
    categorias = [];
  }

  if (unsubscribe) unsubscribe();
  unsubscribe = subscribeProductos((productos) => {
    allProducts = productos;
    renderList(container);
  });
}

function renderList(container) {
  const body = container.querySelector('#inventario-body');
  if (!body) return;

  const activos = allProducts.filter((p) => p.activo !== false);

  if (activos.length === 0) {
    body.innerHTML = `<p class="empty-state">No hay productos activos todavía.</p>`;
    return;
  }

  const grupos = categorias.map((cat) => ({
    categoria: cat,
    productos: activos
      .filter((p) => p.categoriaId === cat.id)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  })).filter((g) => g.productos.length > 0);

  body.innerHTML = grupos.map((g) => `
    <section class="inventory-group">
      <h2 class="inventory-group-title">${g.categoria.nombre} <span class="inventory-group-count">${g.productos.length}</span></h2>
      <ul class="inventory-list">
        ${g.productos.map((p) => {
          const agotado = p.estado === 'agotado' || p.stock <= 0;
          return `
            <li class="inventory-row ${agotado ? 'is-agotado' : ''}" data-id="${p.id}">
              <span class="inventory-row-name">${p.nombre}</span>
              <span class="inventory-row-stock">${agotado ? 'Agotado' : `${p.stock} un.`}</span>
              <span class="inventory-row-price">${formatCOP(p.precio)}</span>
            </li>
          `;
        }).join('')}
      </ul>
    </section>
  `).join('');

  const modalRoot = container.querySelector('#modal-root');
  body.querySelectorAll('.inventory-row').forEach((row) => {
    row.addEventListener('click', () => {
      const producto = allProducts.find((p) => p.id === row.dataset.id);
      if (!producto) return;
      openProductForm(modalRoot, { producto, categorias, onSaved: () => {} });
    });
  });
}

export function stopInventario() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
