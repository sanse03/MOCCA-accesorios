import { login } from '../firebase/auth.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <img src="/logo.png" alt="MOCCA Accesorios" class="login-logo" />
        <hr class="login-accent" />
        <form id="login-form" class="login-form">
          <label for="email">Correo</label>
          <input type="email" id="email" required autocomplete="username" />
          <label for="password">Contraseña</label>
          <input type="password" id="password" required autocomplete="current-password" />
          <p id="login-error" class="login-error" hidden></p>
          <button type="submit" class="btn btn-primary">Entrar</button>
        </form>
      </div>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const errorEl = container.querySelector('#login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const email = form.email.value.trim();
    const password = form.password.value;
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Entrando...';
    try {
      await login(email, password);
      // onAuthChange en main.js se encarga de redirigir según el rol
    } catch (err) {
      errorEl.textContent = 'Correo o contraseña incorrectos.';
      errorEl.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}
