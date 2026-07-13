document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  // Слой авторизации
  const authScreen = document.createElement('div');
  authScreen.id = 'auth-screen';
  authScreen.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">🔐</div>
        <h2>Мой Органайзер</h2>
        <p style="color:var(--text-secondary); margin-bottom:20px;">Войдите в аккаунт</p>
        <input type="email" id="auth-email" placeholder="Email">
        <input type="password" id="auth-password" placeholder="Пароль">
        <button id="auth-login-btn" class="btn-primary">Войти</button>
        <button id="auth-register-btn" class="btn-secondary">Регистрация</button>
        <p id="auth-error" style="color:var(--danger); margin-top:12px; display:none;"></p>
      </div>
    </div>
  `;
  app.appendChild(authScreen);

  // Экран блокировки
  const lockScreen = document.createElement('div');
  lockScreen.id = 'lock-screen';
  lockScreen.style.display = 'none';
  lockScreen.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo" id="lock-icon">🔒</div>
        <h2 id="lock-title">Разблокируйте</h2>
        <p style="color:var(--text-secondary); margin-bottom:8px;" id="lock-user-email"></p>
        <p id="lock-status" style="color:var(--text-secondary); margin-bottom:16px; font-size:14px;">Используйте отпечаток или PIN</p>
        
        <div class="pin-dots" id="pin-dots" style="display:none;">
          <div class="pin-dot"></div>
          <div class="pin-dot"></div>
          <div class="pin-dot"></div>
          <div class="pin-dot"></div>
        </div>
        <p id="pin-error" style="color:var(--danger); margin-top:8px; display:none; font-size:14px;"></p>
        
        <div class="pin-pad" id="pin-pad" style="display:none;">
          <button class="pin-key">1</button>
          <button class="pin-key">2</button>
          <button class="pin-key">3</button>
          <button class="pin-key">4</button>
          <button class="pin-key">5</button>
          <button class="pin-key">6</button>
          <button class="pin-key">7</button>
          <button class="pin-key">8</button>
          <button class="pin-key">9</button>
          <button class="pin-key pin-empty"></button>
          <button class="pin-key">0</button>
          <button class="pin-key pin-delete">⌫</button>
        </div>

        <button id="use-pin-btn" class="btn-secondary" style="margin-top:16px;">🔢 Ввести PIN-код</button>
        <button id="retry-biometric-btn" class="btn-primary" style="margin-top:8px; display:none;">👆 Повторить отпечаток</button>
        <button id="lock-logout-btn" style="background:none; border:none; color:var(--text-secondary); margin-top:16px; cursor:pointer; font-size:14px;">Выйти из аккаунта</button>
      </div>
    </div>
  `;
  app.appendChild(lockScreen);

  // Основной экран
  const mainScreen = document.createElement('div');
  mainScreen.id = 'main-screen';
  mainScreen.style.display = 'none';
  mainScreen.innerHTML = `
    <header>
      <h1>Мой Органайзер</h1>
      <button id="logout-btn">Выйти</button>
    </header>
    <main>
      <div id="savings-page" class="page"></div>
      <div id="car-page" class="page"></div>
      <div id="notes-page" class="page"></div>
    </main>
    <nav id="bottom-nav"></nav>
  `;
  app.appendChild(mainScreen);

  // === Элементы ===
  const emailInput = document.getElementById('auth-email');
  const passInput = document.getElementById('auth-password');
  const loginBtn = document.getElementById('auth-login-btn');
  const registerBtn = document.getElementById('auth-register-btn');
  const authError = document.getElementById('auth-error');
  const logoutBtn = document.getElementById('logout-btn');
  const lockLogoutBtn = document.getElementById('lock-logout-btn');
  const pinDots = document.getElementById('pin-dots');
  const pinPad = document.getElementById('pin-pad');
  const pinError = document.getElementById('pin-error');
  const lockUserEmail = document.getElementById('lock-user-email');
  const lockStatus = document.getElementById('lock-status');
  const lockIcon = document.getElementById('lock-icon');
  const lockTitle = document.getElementById('lock-title');
  const usePinBtn = document.getElementById('use-pin-btn');
  const retryBiometricBtn = document.getElementById('retry-biometric-btn');

  let initialized = false;
  let pinInput = '';
  const CORRECT_PIN = '0000';
  let savedEmail = localStorage.getItem('remembered_email') || '';

  emailInput.value = savedEmail;

  function showError(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
  }

  function saveSession(email) {
    localStorage.setItem('remembered_email', email);
    localStorage.setItem('session_active', 'true');
    localStorage.setItem('session_email', email);
  }

  function clearSession() {
    localStorage.removeItem('session_active');
    localStorage.removeItem('session_email');
  }

  function updatePinDots() {
    const dots = pinDots.querySelectorAll('.pin-dot');
    dots.forEach((dot, i) => dot.classList.toggle('filled', i < pinInput.length));
  }

  function resetPin() {
    pinInput = '';
    updatePinDots();
    pinError.style.display = 'none';
  }

  function showPinInput() {
    lockStatus.textContent = 'Введите PIN-код';
    lockIcon.textContent = '🔢';
    lockTitle.textContent = 'PIN-код';
    pinDots.style.display = 'flex';
    pinPad.style.display = 'grid';
    usePinBtn.style.display = 'none';
    retryBiometricBtn.style.display = 'none';
    resetPin();
  }

  function showBiometricUI() {
    lockStatus.textContent = 'Приложите палец или посмотрите в камеру';
    lockIcon.textContent = '👆';
    lockTitle.textContent = 'Отпечаток';
    pinDots.style.display = 'none';
    pinPad.style.display = 'none';
    usePinBtn.style.display = 'block';
    retryBiometricBtn.style.display = 'none';
  }

  function showLockScreen() {
    const email = localStorage.getItem('session_email') || '';
    lockUserEmail.textContent = email;
    authScreen.style.display = 'none';
    mainScreen.style.display = 'none';
    lockScreen.style.display = 'flex';
    resetPin();
    tryBiometric();
  }

  function unlockApp() {
    lockScreen.style.display = 'none';
    mainScreen.style.display = 'block';
    resetPin();
    if (!initialized) {
      initialized = true;
      initNavigation();
      initSavings();
      initCar();
      initNotes();
    }
  }

  // === Биометрия ===
  async function tryBiometric() {
    showBiometricUI();

    // Проверяем, есть ли уже сохранённый ключ
    const email = localStorage.getItem('session_email') || '';

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]),
          rpId: window.location.hostname,
          allowCredentials: [],
          userVerification: 'required',
          timeout: 30000
        }
      });

      if (credential) {
        lockStatus.textContent = '✓ Доступ разрешён';
        lockIcon.textContent = '✅';
        setTimeout(unlockApp, 400);
      }
    } catch (err) {
      console.log('Биометрия не сработала:', err.message);
      // Показываем кнопку повтора и PIN
      retryBiometricBtn.style.display = 'block';
      lockStatus.textContent = 'Не удалось. Используйте PIN или повторите';
      lockIcon.textContent = '❌';
    }
  }

  // Повторить отпечаток
  retryBiometricBtn.addEventListener('click', () => {
    tryBiometric();
  });

  // Показать PIN
  usePinBtn.addEventListener('click', () => {
    showPinInput();
  });

  // === PIN-клавиатура ===
  document.querySelectorAll('.pin-key').forEach(key => {
    key.addEventListener('click', () => {
      if (key.classList.contains('pin-empty')) return;

      if (key.classList.contains('pin-delete')) {
        pinInput = pinInput.slice(0, -1);
        updatePinDots();
        pinError.style.display = 'none';
        return;
      }

      if (pinInput.length < 4) {
        pinInput += key.textContent;
        updatePinDots();

        if (pinInput.length === 4) {
          const userPin = localStorage.getItem('user_pin') || CORRECT_PIN;
          if (pinInput === CORRECT_PIN || pinInput === userPin) {
            lockIcon.textContent = '✅';
            lockStatus.textContent = '✓ Верный PIN';
            setTimeout(unlockApp, 300);
          } else {
            pinError.textContent = 'Неверный PIN-код';
            pinError.style.display = 'block';
            pinDots.style.animation = 'shake 0.4s ease';
            setTimeout(() => {
              pinDots.style.animation = '';
              resetPin();
            }, 400);
          }
        }
      }
    });
  });

  // === Выход ===
  lockLogoutBtn.addEventListener('click', async () => {
    clearSession();
    await auth.signOut();
    lockScreen.style.display = 'none';
    authScreen.style.display = 'flex';
  });

  // === Вход ===
  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const pass = passInput.value;

    if (!email || !pass) {
      showError('Введите email и пароль');
      return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, pass);
      saveSession(email);
    } catch (err) {
      if (err.code === 'auth/user-not-found') showError('Пользователь не найден');
      else if (err.code === 'auth/wrong-password') showError('Неверный пароль');
      else if (err.code === 'auth/invalid-email') showError('Неверный email');
      else showError(err.message);
    }
  });

  // === Регистрация ===
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
      saveSession(email);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') showError('Этот email уже используется');
      else if (err.code === 'auth/invalid-email') showError('Неверный email');
      else showError(err.message);
    }
  });

  passInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  logoutBtn.addEventListener('click', async () => {
    await auth.signOut();
  });

  // === Следим за авторизацией ===
  auth.onAuthStateChanged(user => {
    if (user) {
      showLockScreen();
    } else {
      authScreen.style.display = 'flex';
      lockScreen.style.display = 'none';
      mainScreen.style.display = 'none';
      emailInput.value = savedEmail;
      passInput.value = '';
      authError.style.display = 'none';
      initialized = false;
      clearSession();
    }
  });
});
