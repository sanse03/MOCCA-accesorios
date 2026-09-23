// Íconos de línea fina (stroke, sin relleno) para que combinen con el trazo
// del sunburst del logo de MOCCA. Usan currentColor, así heredan el color
// del botón que los contiene (activo, inactivo, o el rojo de "Salir").

const strokeProps = 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';

export const icons = {
  catalogo: `
    <svg viewBox="0 0 24 24" ${strokeProps}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  `,
  carrito: `
    <svg viewBox="0 0 24 24" ${strokeProps}>
      <path d="M6 8h12l-1.1 11.2a2 2 0 0 1-2 1.8H9.1a2 2 0 0 1-2-1.8L6 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  `,
  historial: `
    <svg viewBox="0 0 24 24" ${strokeProps}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l2.8 1.8" />
    </svg>
  `,
  salir: `
    <svg viewBox="0 0 24 24" ${strokeProps}>
      <path d="M9.5 4H6.5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M15 16l4-4-4-4" />
      <path d="M19 12H9.5" />
    </svg>
  `
};
