import { createCategory, renameCategory, deleteCategory } from '../../firebase/categoriesAdmin.js';

export async function openCategoryManager(modalRoot, { getCategorias, onChanged }) {
  const categorias = await getCategorias();
  renderManager(modalRoot, categorias, { getCategorias, onChanged });
}

function renderManager(modalRoot, categorias, deps) {
  modalRoot.innerHTML = `
    <div class="modal-overlay" id="cm-overlay">
      <div class="modal-sheet">
        <div class="modal-header">
          <h2>Categorías</h2>
          <button type="button" class="modal-close" id="cm-close" aria-label="Cerrar">&#10005;</button>
        </div>
        <div class="modal-body">
          <ul class="category-list">
            ${categorias.map((c) => `
              <li class="category-list-item">
                <input type="text" class="category-name-input" value="${c.nombre}" data-id="${c.id}" />
                <button type="button" class="category-delete" data-id="${c.id}" aria-label="Borrar categoría">&#10005;</button>
              </li>
            `).join('')}
          </ul>
          <div class="category-add-row">
            <input type="text" id="cm-new-name" placeholder="Nueva categoría..." />
            <button type="button" class="btn btn-secondary" id="cm-add">Agregar</button>
          </div>
          <p id="cm-error" class="form-error" hidden></p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" id="cm-done">Listo</button>
        </div>
      </div>
    </div>
  `;

  const close = () => {
    modalRoot.innerHTML = '';
  };
  const errorEl = modalRoot.querySelector('#cm-error');

  const refresh = async () => {
    const fresh = await deps.getCategorias();
    renderManager(modalRoot, fresh, deps);
    deps.onChanged();
  };

  modalRoot.querySelector('#cm-close').addEventListener('click', close);
  modalRoot.querySelector('#cm-done').addEventListener('click', close);

  modalRoot.querySelectorAll('.category-name-input').forEach((input) => {
    input.addEventListener('change', async () => {
      const nombre = input.value.trim();
      if (!nombre) return;
      await renameCategory(input.dataset.id, nombre);
      deps.onChanged();
    });
  });

  modalRoot.querySelectorAll('.category-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      errorEl.hidden = true;
      if (!confirm('¿Borrar esta categoría?')) return;
      try {
        await deleteCategory(btn.dataset.id);
        await refresh();
      } catch (err) {
        errorEl.textContent = err.message || 'No se pudo borrar la categoría.';
        errorEl.hidden = false;
      }
    });
  });

  modalRoot.querySelector('#cm-add').addEventListener('click', async () => {
    const input = modalRoot.querySelector('#cm-new-name');
    const nombre = input.value.trim();
    if (!nombre) return;
    errorEl.hidden = true;
    try {
      await createCategory(nombre);
      await refresh();
    } catch (err) {
      errorEl.textContent = 'No se pudo crear la categoría.';
      errorEl.hidden = false;
    }
  });
}
