import { getCategoryColor } from '../utils/categoryColors.js';

export function formatCOP(value) {
  return '$' + Math.round(value || 0).toLocaleString('es-CO');
}

export function productCard(producto, index = 0, options = {}) {
  const agotado = producto.estado === 'agotado' || producto.stock <= 0;
  const primerFoto = producto.fotos && producto.fotos.length > 0 ? producto.fotos[0] : null;
  const fotoUrl = typeof primerFoto === 'string' ? primerFoto : primerFoto?.url;
  const tint = getCategoryColor(producto.categoriaId);
  const editable = options.isAdmin ? 'is-editable' : '';

  return `
    <article class="product-card ${agotado ? 'is-agotado' : ''} ${editable}" data-id="${producto.id}" style="--card-index: ${index}">
      <div class="product-photo" style="--card-tint: ${tint}">
        ${fotoUrl
          ? `<img src="${fotoUrl}" alt="${producto.nombre}" loading="lazy" />`
          : `<div class="product-photo-placeholder">Sin foto</div>`}
        ${agotado ? '<span class="badge badge-agotado">Agotado</span>' : ''}
        ${options.isAdmin ? '<span class="edit-badge" aria-hidden="true">&#9998;</span>' : ''}
      </div>
      <div class="product-info">
        <p class="product-name">${producto.nombre}</p>
        <p class="product-price">${formatCOP(producto.precio)}</p>
      </div>
    </article>
  `;
}
