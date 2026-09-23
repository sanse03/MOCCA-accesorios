import { subscribeProductos } from '../../firebase/products.js';
import { getCategorias } from '../../firebase/categories.js';
import { productCard } from '../../components/productCard.js';
import { getCategoryDotColor } from '../../utils/categoryColors.js';
import { getCategoryIcon } from '../../utils/categoryIcons.js';
import { openProductForm } from '../admin/productForm.js';
import { openCategoryManager } from '../admin/categoryManager.js';
import { addToCart } from '../../utils/cartStore.js';
import { openLightbox } from '../../components/lightbox.js';

let allProducts = [];
let categorias = [];
let activeCategory = 'todas';
let searchTerm = '';
let unsubscribe = null;
let isAdmin = false;

export async function renderCatalogo(container, options = {}) {
  isAdmin = !!options.isAdmin;

  container.innerHTML = `
    <div class="catalogo-screen">
      <header class="catalogo-header">
        <div class="catalogo-title-row">
          <div class="catalogo-brand">
            <img src="/logo.png" alt="" class="catalogo-logo" />
            <h1 class="catalogo-title">Catálogo</h1>
          </div>
          ${isAdmin ? '<button type="button" class="text-link" id="manage-categories-btn">Editar categorías</button>' : ''}
        </div>
        <input type="search" id="buscador" class="buscador" placeholder="Buscar producto..." />
        <div id="chips" class="category-chips"></div>
      </header>
      <div id="grid" class="product-grid">
        <p class="loading">Cargando productos...</p>
      </div>
    </div>
    ${isAdmin ? '<button type="button" class="fab-add" id="fab-add-product" aria-label="Nuevo producto">+</button>' : ''}
    <div id="modal-root"></div>
  `;

  try {
    categorias = await getCategorias();
  } catch (err) {
    categorias = [];
  }
  renderChips(container);

  const buscador = container.querySelector('#buscador');
  buscador.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    renderGrid(container);
  });

  const modalRoot = container.querySelector('#modal-root');

  if (isAdmin) {
    container.querySelector('#fab-add-product').addEventListener('click', () => {
      openProductForm(modalRoot, {
        producto: null,
        categorias,
        onSaved: () => {} // el catálogo se actualiza solo vía subscribeProductos
      });
    });

    container.querySelector('#manage-categories-btn').addEventListener('click', () => {
      openCategoryManager(modalRoot, {
        getCategorias,
        onChanged: async () => {
          categorias = await getCategorias();
          renderChips(container);
        }
      });
    });

    container.querySelector('#grid').addEventListener('click', (e) => {
      if (e.target.closest('.quick-add-btn')) return; // no aplica en admin, no existe el botón
      const card = e.target.closest('.product-card');
      if (!card) return;
      const producto = allProducts.find((p) => p.id === card.dataset.id);
      if (!producto) return;
      openProductForm(modalRoot, { producto, categorias, onSaved: () => {} });
    });
  } else {
    container.querySelector('#grid').addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const producto = allProducts.find((p) => p.id === card.dataset.id);
      if (!producto) return;

      const addBtn = e.target.closest('.quick-add-btn');
      if (addBtn) {
        addToCart(producto);
        addBtn.textContent = '✓';
        setTimeout(() => { addBtn.textContent = '+'; }, 600);
        return;
      }

      const photoEl = e.target.closest('.product-photo');
      if (photoEl) {
        const img = photoEl.querySelector('img');
        if (img) openLightbox(img.src, producto.nombre, producto.precio);
      }
    });
  }

  if (unsubscribe) unsubscribe();
  unsubscribe = subscribeProductos((productos) => {
    allProducts = productos;
    renderGrid(container);
  });
}

function renderChips(container) {
  const chipsEl = container.querySelector('#chips');
  const chips = [{ id: 'todas', nombre: 'Todas' }, ...categorias];
  chipsEl.innerHTML = chips.map(c => {
    const icon = c.id === 'todas'
      ? ''
      : `<span class="chip-icon" style="color:${getCategoryDotColor(c.id)}">${getCategoryIcon(c.id)}</span>`;
    return `
      <button class="chip ${activeCategory === c.id ? 'is-active' : ''}" data-cat="${c.id}">${icon}${c.nombre}</button>
    `;
  }).join('');

  chipsEl.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderChips(container);
      renderGrid(container);
    });
  });
}

function renderGrid(container) {
  const gridEl = container.querySelector('#grid');
  // Los productos archivados (activo:false) nunca se muestran en el catálogo.
  // Si el campo no existe (datos cargados antes de esta función), se tratan como activos.
  let filtered = allProducts.filter(p => p.activo !== false);

  if (activeCategory !== 'todas') {
    filtered = filtered.filter(p => p.categoriaId === activeCategory);
  }
  if (searchTerm) {
    filtered = filtered.filter(p => p.nombre.toLowerCase().includes(searchTerm));
  }

  if (filtered.length === 0) {
    gridEl.innerHTML = `<p class="empty-state">No encontramos productos con ese criterio.</p>`;
    return;
  }

  gridEl.innerHTML = filtered.map((p, i) => productCard(p, i, { isAdmin })).join('');
}

export function stopCatalogo() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
