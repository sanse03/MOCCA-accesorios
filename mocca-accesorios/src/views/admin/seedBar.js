import { seedCatalogo } from '../../firebase/seed.js';

/**
 * Barra temporal solo para el administrador: permite cargar el catálogo inicial
 * (las 8 categorías y ~228 productos de tus archivos Excel/CSV) a Firestore.
 * Es segura de usar varias veces — nunca duplica ni pisa datos existentes.
 * Una vez que tengas todo tu catálogo cargado y con fotos, podemos quitar esta barra.
 */
export function renderSeedBar(container) {
  container.innerHTML = `
    <div class="admin-bar">
      <button id="seed-btn" class="btn btn-secondary">Cargar catálogo inicial</button>
      <span id="seed-msg" class="admin-bar-msg"></span>
    </div>
  `;

  const btn = container.querySelector('#seed-btn');
  const msg = container.querySelector('#seed-msg');

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Cargando...';
    msg.textContent = '';
    try {
      const { nuevasCategorias, nuevosProductos } = await seedCatalogo();
      msg.textContent = `Listo: ${nuevasCategorias} categorías y ${nuevosProductos} productos nuevos agregados.`;
    } catch (err) {
      msg.textContent = 'Ocurrió un error al cargar. Revisa la consola.';
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Cargar catálogo inicial';
    }
  });
}
