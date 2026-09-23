import './styles/tokens.css';
import './styles/main.css';
import { onAuthChange, logout } from './firebase/auth.js';
import { renderLogin } from './views/login.js';
import { renderCatalogo, stopCatalogo } from './views/vendedor/catalogo.js';
import { renderCarrito, stopCarrito } from './views/vendedor/carrito.js';
import { renderHistorial, stopHistorial } from './views/vendedor/historial.js';
import { renderInventario, stopInventario } from './views/admin/inventario.js';
import { subscribeCart, getCartCount } from './utils/cartStore.js';
import { icons } from './utils/icons.js';

const app = document.getElementById('app');
let currentView = 'catalogo';
let currentUser = null;
let unsubscribeCartBadge = null;

onAuthChange((user) => {
  stopAllViews();
  if (unsubscribeCartBadge) { unsubscribeCartBadge(); unsubscribeCartBadge = null; }

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

  currentUser = user;
  currentView = 'catalogo';
  renderShell(user);
});

function stopAllViews() {
  stopCatalogo();
  stopCarrito();
  stopHistorial();
  stopInventario();
}

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

  const middleTab = esAdmin
    ? `<button class="nav-item" data-view="inventario">
         <span class="nav-icon">${icons.inventario}</span>
         <span class="nav-label">Inventario</span>
       </button>`
    : `<button class="nav-item" data-view="carrito">
         <span class="nav-icon cart-icon-wrap">${icons.carrito}<span class="cart-badge" id="cart-badge" hidden>0</span></span>
         <span class="nav-label">Carrito</span>
       </button>`;

  app.innerHTML = `
    <div class="app-shell">
      <div class="role-strip role-strip-${esAdmin ? 'admin' : 'vendedor'}">
        <span class="role-strip-badge">${esAdmin ? 'Módulo administración' : 'Módulo ventas'}</span>
        <span class="role-strip-name">${user.perfil.nombre || user.email}</span>
      </div>
      <main id="main-view"></main>
      <nav class="bottom-nav">
        <button class="nav-item" data-view="catalogo">
          <span class="nav-icon">${icons.catalogo}</span>
          <span class="nav-label">Catálogo</span>
        </button>
        ${middleTab}
        <button class="nav-item" data-view="historial">
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

  app.querySelector('#logout-btn').addEventListener('click', logout);

  app.querySelectorAll('.nav-item[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      switchView(esAdmin);
    });
  });

  if (!esAdmin) {
    unsubscribeCartBadge = subscribeCart(() => {
      const badge = app.querySelector('#cart-badge');
      if (!badge) return;
      const count = getCartCount();
      badge.textContent = count;
      badge.hidden = count === 0;
    });
  }

  switchView(esAdmin);
}

function switchView(esAdmin) {
  stopAllViews();

  app.querySelectorAll('.nav-item[data-view]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === currentView);
  });

  const mainView = app.querySelector('#main-view');

  if (currentView === 'carrito' && !esAdmin) {
    renderCarrito(mainView, currentUser);
  } else if (currentView === 'inventario' && esAdmin) {
    renderInventario(mainView);
  } else if (currentView === 'historial') {
    renderHistorial(mainView, currentUser, esAdmin);
  } else {
    renderCatalogo(mainView, { isAdmin: esAdmin });
  }
}
