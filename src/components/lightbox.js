import { formatCOP } from './productCard.js';

// Zoom simple de foto: pantalla completa, con nombre y precio, tocar en
// cualquier lado para cerrar.
export function openLightbox(url, nombre = '', precio = null) {
  const existing = document.getElementById('lightbox-root');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'lightbox-root';
  el.className = 'lightbox-overlay';
  el.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Cerrar">&#10005;</button>
    <div class="lightbox-content">
      <img src="${url}" alt="${nombre}" class="lightbox-img" />
      <div class="lightbox-caption">
        <p class="lightbox-name">${nombre}</p>
        ${precio != null ? `<p class="lightbox-price">${formatCOP(precio)}</p>` : ''}
      </div>
    </div>
  `;

  const close = () => el.remove();
  el.addEventListener('click', close);
  document.body.appendChild(el);
}
