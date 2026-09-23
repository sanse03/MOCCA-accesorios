import { createProduct, updateProduct, archiveProduct } from '../../firebase/productsAdmin.js';
import { uploadProductPhoto, deleteProductPhoto } from '../../firebase/storage.js';
import { resizeImage } from '../../utils/imageResize.js';
import { computeNextCode } from '../../utils/productCode.js';
import { attachCurrencyInput, getCurrencyValue, setCurrencyValue } from '../../utils/formatInput.js';

let state = null;

export function openProductForm(modalRoot, { producto, categorias, onSaved }) {
  const isEditing = !!producto;
  state = { fotos: producto?.fotos ? [...producto.fotos] : [], codigo: producto?.codigo || null };

  modalRoot.innerHTML = `
    <div class="modal-overlay" id="pf-overlay">
      <div class="modal-sheet">
        <div class="modal-header">
          <h2>${isEditing ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" class="modal-close" id="pf-close" aria-label="Cerrar">&#10005;</button>
        </div>
        <div class="modal-body">
          <div class="photo-uploader" id="pf-photos"></div>

          <label for="pf-nombre">Nombre</label>
          <input type="text" id="pf-nombre" value="${producto?.nombre ?? ''}" placeholder="Ej. Topos rayas" />

          <label for="pf-categoria">Categoría</label>
          <select id="pf-categoria">
            ${categorias.map(c => `<option value="${c.id}" ${producto?.categoriaId === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
          </select>

          <div class="form-row">
            <div class="form-field">
              <label for="pf-precio">Precio (COP)</label>
              <div class="input-prefix">
                <span>$</span>
                <input type="text" id="pf-precio" inputmode="numeric" placeholder="0" />
              </div>
            </div>
            <div class="form-field">
              <label for="pf-stock">Stock</label>
              <input type="number" id="pf-stock" min="0" step="1" inputmode="numeric" value="${producto?.stock ?? ''}" placeholder="0" />
            </div>
          </div>

          ${isEditing ? `<p class="pf-codigo">Código: <strong>${producto.codigo}</strong></p>` : ''}
          <p id="pf-error" class="form-error" hidden></p>
        </div>
        <div class="modal-footer">
          ${isEditing ? '<button type="button" class="btn btn-danger" id="pf-archive">Archivar</button>' : ''}
          <button type="button" class="btn btn-secondary" id="pf-cancel">Cancelar</button>
          <button type="button" class="btn btn-primary" id="pf-save">Guardar</button>
        </div>
      </div>
    </div>
  `;

  renderPhotoSlots(modalRoot);

  const precioInput = modalRoot.querySelector('#pf-precio');
  setCurrencyValue(precioInput, producto?.precio ?? 0);
  attachCurrencyInput(precioInput);

  const close = () => {
    modalRoot.innerHTML = '';
    state = null;
  };

  modalRoot.querySelector('#pf-close').addEventListener('click', close);
  modalRoot.querySelector('#pf-cancel').addEventListener('click', close);

  if (isEditing) {
    modalRoot.querySelector('#pf-archive').addEventListener('click', async () => {
      if (!confirm(`¿Archivar "${producto.nombre}"? Deja de verse en el catálogo; puedes restaurarlo después desde la base de datos.`)) return;
      await archiveProduct(producto.codigo);
      close();
      onSaved();
    });
  }

  modalRoot.querySelector('#pf-save').addEventListener('click', async () => {
    const errorEl = modalRoot.querySelector('#pf-error');
    errorEl.hidden = true;

    const nombre = modalRoot.querySelector('#pf-nombre').value.trim();
    const categoriaId = modalRoot.querySelector('#pf-categoria').value;
    const precio = getCurrencyValue(modalRoot.querySelector('#pf-precio'));
    const stock = Number(modalRoot.querySelector('#pf-stock').value);

    if (!nombre) return showError(errorEl, 'Ponle un nombre al producto.');
    if (!categoriaId) return showError(errorEl, 'Selecciona una categoría.');
    if (!Number.isFinite(precio) || precio < 0) return showError(errorEl, 'El precio no es válido.');
    if (!Number.isFinite(stock) || stock < 0) return showError(errorEl, 'El stock no es válido.');

    const saveBtn = modalRoot.querySelector('#pf-save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando...';

    try {
      const estado = stock <= 0 ? 'agotado' : 'activo';
      const data = { nombre, categoriaId, precio, stock, estado, fotos: state.fotos };

      if (isEditing) {
        await updateProduct(producto.codigo, data);
      } else {
        const categoria = categorias.find((c) => c.id === categoriaId);
        const codigo = await computeNextCode(categoriaId, categoria.prefijo);
        await createProduct(codigo, data);
      }
      close();
      onSaved();
    } catch (err) {
      console.error(err);
      showError(errorEl, 'No se pudo guardar. Intenta de nuevo.');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Guardar';
    }
  });
}

function showError(el, msg) {
  el.textContent = msg;
  el.hidden = false;
}

function renderPhotoSlots(modalRoot) {
  const wrap = modalRoot.querySelector('#pf-photos');
  const slots = [];

  for (let i = 0; i < 4; i++) {
    const foto = state.fotos[i];
    if (foto) {
      slots.push(`
        <div class="photo-slot has-photo">
          <img src="${foto.url}" alt="" />
          <button type="button" class="photo-remove" data-index="${i}" aria-label="Quitar foto">&#10005;</button>
        </div>
      `);
    } else {
      slots.push(`
        <label class="photo-slot photo-add">
          <input type="file" accept="image/*" data-index="${i}" hidden />
          <span>+</span>
        </label>
      `);
    }
  }
  wrap.innerHTML = slots.join('');

  wrap.querySelectorAll('.photo-remove').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const i = Number(btn.dataset.index);
      const foto = state.fotos[i];
      state.fotos.splice(i, 1);
      renderPhotoSlots(modalRoot);
      if (foto?.path) await deleteProductPhoto(foto.path);
    });
  });

  wrap.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const i = Number(input.dataset.index);
      const slot = input.closest('.photo-slot');
      slot.classList.add('is-loading');
      try {
        const carpeta = state.codigo || `tmp-${Date.now()}`;
        const blob = await resizeImage(file);
        const { url, path } = await uploadProductPhoto(carpeta, blob, file.name);
        state.fotos[i] = { url, path };
        renderPhotoSlots(modalRoot);
      } catch (err) {
        console.error(err);
        slot.classList.remove('is-loading');
        alert('No se pudo subir la foto. Intenta de nuevo.');
      }
    });
  });
}
