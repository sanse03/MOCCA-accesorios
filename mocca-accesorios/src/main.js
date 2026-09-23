import './styles/tokens.css';
import './styles/main.css';
import { onAuthChange, logout } from './firebase/auth.js';
import { renderLogin } from './views/login.js';
import { renderCatalogo, stopCatalogo } from './views/vendedor/catalogo.js';
import { renderSeedBar } from './views/admin/seedBar.js';
import { icons } from './utils/icons.js';

const app = document.getElementById('app');

onAuthChange((user) => {
  stopCatalogo();

  if (!user) {
    renderLogin(app);
    return;
  }

  if (!user.perfil) {
    renderSinAcceso(app, 'No encontramos tu perfil de usuario. Contacta al administrador.');
    return;
  }

  if (!user.perfil.activo) {
    renderSinAcceso(app, 'Tu cuenta no tiene acceso activo. Contacta al administrador.');
    return;
  }

  renderShell(user);
});

function renderSinAcceso(container, mensaje) {
  container.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <p>${mensaje}</p>
        <button id="salir" class="btn btn-secondary">Salir</button>
      </div>
    </div>
  `;
  container.querySelector('#salir').addEventListener('click', logout);
}

function renderShell(user) {
  const esAdmin = user.perfil.rol === 'admin';

  app.innerHTML = `
    <div class="app-shell">
      <div id="admin-bar-slot"></div>
      <main id="main-view"></main>
      <nav class="bottom-nav">
        <button class="nav-item is-active" data-view="catalogo">
          <span class="nav-icon">${icons.catalogo}</span>
          <span class="nav-label">Catálogo</span>
        </button>
        <button class="nav-item" data-view="carrito" disabled title="Próximamente">
          <span class="nav-icon">${icons.carrito}</span>
          <span class="nav-label">Carrito</span>
        </button>
        <button class="nav-item" data-view="historial" disabled title="Próximamente">
          <span class="nav-icon">${icons.historial}</span>
          <span class="nav-label">Historial</span>
        </button>
        <button class="nav-item nav-logout" id="logout-btn">
          <span class="nav-icon">${icons.salir}</span>
          <span class="nav-label">Salir</span>
        </button>
      </nav>
    </div>
  `;

  if (esAdmin) {
    renderSeedBar(app.querySelector('#admin-bar-slot'));
  }

  renderCatalogo(app.querySelector('#main-view'), { isAdmin: esAdmin });
  app.querySelector('#logout-btn').addEventListener('click', logout);
}
