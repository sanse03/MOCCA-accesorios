// Íconos de línea fina por categoría, mismo estilo que los de la barra inferior
// (stroke, currentColor) para que el catálogo tenga un lenguaje de íconos consistente.

const s = 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';

export const categoryIcons = {
  caimanes: `
    <svg viewBox="0 0 24 24" ${s}>
      <path d="M11 12 4 8v8l7-4Z" />
      <path d="M13 12l7-4v8l-7-4Z" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  `,
  cinturones: `
    <svg viewBox="0 0 24 24" ${s}>
      <rect x="3" y="10.5" width="18" height="3" rx="1.5" />
      <rect x="9.3" y="8.3" width="5.4" height="7.4" rx="1.2" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  `,
  bolsos: `
    <svg viewBox="0 0 24 24" ${s}>
      <path d="M7 10h10l-.9 9.4a1.6 1.6 0 0 1-1.6 1.5H9.5a1.6 1.6 0 0 1-1.6-1.5L7 10Z" />
      <path d="M9.4 10V8.2a2.6 2.6 0 0 1 5.2 0V10" />
    </svg>
  `,
  pulseras: `
    <svg viewBox="0 0 24 24" ${s}>
      <ellipse cx="12" cy="12" rx="7.2" ry="5" />
    </svg>
  `,
  aretes: `
    <svg viewBox="0 0 24 24" ${s}>
      <circle cx="12" cy="7.3" r="1.9" />
      <path d="M12 9.2v1.8" />
      <path d="M9.6 15a2.4 2.4 0 1 0 4.8 0c0-1.3-2.4-3.8-2.4-3.8S9.6 13.7 9.6 15Z" />
    </svg>
  `,
  celulares: `
    <svg viewBox="0 0 24 24" ${s}>
      <circle cx="9.2" cy="12" r="4" />
      <circle cx="14.8" cy="12" r="4" />
    </svg>
  `,
  anillos: `
    <svg viewBox="0 0 24 24" ${s}>
      <circle cx="12" cy="14.2" r="5.3" />
      <path d="M12 8.9 9.9 5.4h4.2L12 8.9Z" />
    </svg>
  `,
  collares: `
    <svg viewBox="0 0 24 24" ${s}>
      <path d="M4.5 6c0 5.8 3.8 9.8 7.5 9.8S19.5 11.8 19.5 6" />
      <circle cx="12" cy="16.8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  `
};

export function getCategoryIcon(categoriaId) {
  return categoryIcons[categoriaId] || '';
}
