document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  // Слой авторизации
  const authScreen = document.createElement('div');
  authScreen.id = 'auth-screen';
  authScreen.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Мой Органайзер</h2>
        <p style="color:#888; margin-bottom:20px;">Войдите или зарегистрируйтесь</p>
        <input type="email" id="auth-email" placeholder="Email">
        <input type="password" id="auth-password" placeholder="Пароль">
        <button id="auth-login-btn" class="btn-primary">Войти</button>
        <button id="auth-register-btn" class="btn-secondary">Регистрация</button>
        <p id="auth-error" style="color:#f44336; margin-top:12px; display:none;"></p>
      </div>
    </div>
  `;
  app.appendChild(authScreen);

  // Основной экран (скрыт пока)
  const mainScreen = document.createElement('div');
  mainScreen.id = 'main-screen';
  mainScreen.style.display = 'none';
  mainScreen.innerHTML = `
    <header>
      <h1>Мой Органайзер</h1>
      <button id="logout-btn" style="position:absolute; right:16px; top:14px; background:none; border:none; color:#fff; font-size:14px; cursor:pointer;">Выйти</button>
    </header>
    <main>
      <div id="savings-page" class="page"></div>
      <div id="car-page" class="page"></div>
      <div id="notes-page" class="page"></div>
    </main>
    <nav id="bottom-nav"></nav>
  `;
  app.appendChild(mainScreen);

  // Элементы
  const emailInput = document.getElementById('auth-email');
  const passInput = document.getElementById('auth-password');
  const loginBtn = document.getElementById('auth-login-btn');
  const registerBtn = document.getElementById('auth-register-btn');
  const authError = document.getElementById('auth-error');
  const logoutBtn = document.getElementById('logout-btn');

  // Показать ошибку
  function showError(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
  }

  // Вход
  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const pass = passInput.value;

    if (!email || !pass) {
      showError('Введите email и пароль');
      return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, pass);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        showError('Пользователь не найден');
      } else if (err.code === 'auth/wrong-password') {
        showError('Неверный пароль');
      } else {
        showError(err.message);
      }
    }
  });

  // Регистрация
  registerBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const pass = passInput.value;

    if (!email || !pass) {
      showError('Введите email и пароль');
      return;
    }

    if (pass.length < 6) {
      showError('Пароль должен быть минимум 6 символов');
      return;
    }

    try {
      await auth.createUserWithEmailAndPassword(email, pass);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        showError('Этот email уже используется');
      } else {
        showError(err.message);
      }
    }
  });

  // Enter для входа
  passInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  // Выход
  logoutBtn.addEventListener('click', async () => {
    await auth.signOut();
  });

  // Следим за авторизацией
  auth.onAuthStateChanged(user => {
    if (user) {
      authScreen.style.display = 'none';
      mainScreen.style.display = 'block';
      initNavigation();
      initSavings();
      initCar();
      initNotes();
    } else {
      authScreen.style.display = 'flex';
      mainScreen.style.display = 'none';
      emailInput.value = '';
      passInput.value = '';
      authError.style.display = 'none';
    }
  });
});
