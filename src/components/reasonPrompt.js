// Modal genérico para acciones que necesitan un motivo escrito
// (anular venta, solicitar anulación, etc.)
export function openReasonPrompt(modalRoot, { title, confirmLabel = 'Confirmar', onConfirm }) {
  modalRoot.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-sheet">
        <div class="modal-header">
          <h2>${title}</h2>
          <button type="button" class="modal-close" id="rp-close">&#10005;</button>
        </div>
        <div class="modal-body">
          <label for="rp-motivo">Motivo</label>
          <textarea id="rp-motivo" rows="3" placeholder="Explica brevemente qué pasó..."></textarea>
          <p id="rp-error" class="form-error" hidden></p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="rp-cancel">Cancelar</button>
          <button type="button" class="btn btn-danger" id="rp-confirm">${confirmLabel}</button>
        </div>
      </div>
    </div>
  `;

  const close = () => { modalRoot.innerHTML = ''; };
  modalRoot.querySelector('#rp-close').addEventListener('click', close);
  modalRoot.querySelector('#rp-cancel').addEventListener('click', close);

  modalRoot.querySelector('#rp-confirm').addEventListener('click', async () => {
    const errorEl = modalRoot.querySelector('#rp-error');
    const motivo = modalRoot.querySelector('#rp-motivo').value.trim();
    errorEl.hidden = true;

    if (!motivo) {
      errorEl.textContent = 'Escribe el motivo antes de continuar.';
      errorEl.hidden = false;
      return;
    }

    const btn = modalRoot.querySelector('#rp-confirm');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      await onConfirm(motivo);
      close();
    } catch (err) {
      errorEl.textContent = err.message || 'No se pudo completar. Intenta de nuevo.';
      errorEl.hidden = false;
      btn.disabled = false;
      btn.textContent = confirmLabel;
    }
  });
}
