// Zoom simple de foto: pantalla completa, tocar en cualquier lado para cerrar.
export function openLightbox(url, alt = '') {
  const existing = document.getElementById('lightbox-root');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'lightbox-root';
  el.className = 'lightbox-overlay';
  el.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Cerrar">&#10005;</button>
    <img src="${url}" alt="${alt}" class="lightbox-img" />
  `;

  const close = () => el.remove();
  el.addEventListener('click', close);
  document.body.appendChild(el);
}
