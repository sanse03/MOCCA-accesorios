// Un color por categoría, tomado de la paleta con nombre que definiste
// (Sky, Lavender, Butter, Matcha, Pink, Tangerine). Como son 8 categorías y
// 6 colores, Tangerine y Lavender se repiten una vez cada uno.
// Se usa como fondo de la foto en el catálogo para reconocer la categoría de un vistazo.
export const categoryColors = {
  caimanes: '#FFE0CB',   // Tangerine suave
  cinturones: '#EBF0D5', // Matcha suave
  bolsos: '#DBEBF8',     // Sky suave
  pulseras: '#FDDFE7',   // Pink suave
  aretes: '#F4EDF9',     // Lavender suave
  anillos: '#FCF4DA',    // Butter suave
  celulares: '#FFE0CB',  // Tangerine suave (repite)
  collares: '#F4EDF9'    // Lavender suave (repite)
};

export function getCategoryColor(categoriaId) {
  return categoryColors[categoriaId] || '#FFF4EC';
}

// Versión saturada (el color con nombre tal cual), para el puntito/ícono de
// color de los chips de filtro — el tono suave del fondo de foto se ve casi
// invisible a ese tamaño.
export const categoryDotColors = {
  caimanes: '#FF8F45',   // Tangerine
  cinturones: '#B7C96A', // Matcha
  bolsos: '#7FB9E6',     // Sky
  pulseras: '#F98BA9',   // Pink
  aretes: '#D6BEEA',     // Lavender
  anillos: '#F4D77A',    // Butter
  celulares: '#FF8F45',  // Tangerine (repite)
  collares: '#D6BEEA'    // Lavender (repite)
};

export function getCategoryDotColor(categoriaId) {
  return categoryDotColors[categoriaId] || 'var(--color-teal)';
}
