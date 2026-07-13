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

  // Экран PIN-кода
  const pinScreen = document.createElement('div');
  pinScreen.id = 'pin-screen';
  pinScreen.style.display = 'none';
  pinScreen.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">🔒</div>
        <h2>Введите PIN-код</h2>
        <p style="color:var(--text-secondary); margin-bottom:8px;" id="pin-user-email"></p>
        <div class="pin-dots" id="pin-dots">
          <div class="pin-dot"></div>
          <div class="pin-dot"></div>
          <div class="pin-dot"></div>
          <div class="pin-dot"></div>
        </div>
        <p id="pin-error-msg" style="color:var(--danger); margin-top:8px; display:none; font-size:14px;"></p>
        <div class="pin-pad">
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
        <button id="pin-logout-btn" style="background:none; border:none; color:var(--text-secondary); margin-top:20px; cursor:pointer; font-size:14px;">Выйти из аккаунта</button>
      </div>
    </div>
  `;
  app.appendChild(pinScreen);

  // Экран смены PIN
  const changePinScreen = document.createElement('div');
  changePinScreen.id = 'change-pin-screen';
  changePinScreen.style.display = 'none';
  changePinScreen.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h2 id="change-pin-title">Создайте PIN-код</h2>
        <p id="change-pin-message" style="color:var(--text-secondary); margin-bottom:16px; font-size:14px;">Придумайте 4 цифры</p>
        <div class="pin-dots" id="change-pin-dots">
          <div class="pin-dot"></div>
          <div class="pin-dot"></div>
          <div class="pin-dot"></div>
          <div class="pin-dot"></div>
        </div>
        <p id="change-pin-error" style="color:var(--danger); margin-top:8px; display:none; font-size:14px;"></p>
        <div class="pin-pad" id="change-pin-pad">
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
        <button id="change-pin-cancel" class="btn-secondary" style="margin-top:12px;">Отмена</button>
      </div>
    </div>
  `;
  app.appendChild(changePinScreen);

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
    <button id="settings-btn" class="settings-gear">⚙️</button>
  `;
  app.appendChild(mainScreen);

  // Настройки
  const settingsModalEl = document.createElement('div');
  settingsModalEl.id = 'settings-modal';
  settingsModalEl.className = 'modal';
  settingsModalEl.innerHTML = `
    <div class="modal-content">
      <h3>Настройки</h3>
      <button id="change-pin-open-btn" class="btn-secondary" style="width:100%; margin-bottom:8px;">🔢 Сменить PIN-код</button>
      <button id="settings-close-btn" class="btn-primary" style="width:100%;">Закрыть</button>
    </div>
  `;
  app.appendChild(settingsModalEl);

  // Элементы
  const emailInput = document.getElementById('auth-email');
  const passInput = document.getElementById('auth-password');
  const loginBtn = document.getElementById('auth-login-btn');
  const registerBtn = document.getElementById('auth-register-btn');
  const authError = document.getElementById('auth-error');
  const logoutBtn = document.getElementById('logout-btn');
  const pinLogoutBtn = document.getElementById('pin-logout-btn');
  const pinUserEmail = document.getElementById('pin-user-email');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const changePinOpenBtn = document.getElementById('change-pin-open-btn');
  const settingsCloseBtn = document.getElementById('settings-close-btn');

  let initialized = false;
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

  // ==================== PIN-КЛАВИАТУРА ====================
  let pinInput = '';
  const pinDots = document.getElementById('pin-dots');
  const pinErrorMsg = document.getElementById('pin-error-msg');

  function updateDots() {
    const dots = pinDots.querySelectorAll('.pin-dot');
    dots.forEach((d, i) => d.classList.toggle('filled', i < pinInput.length));
  }

  function resetPin() {
    pinInput = '';
    updateDots();
    pinErrorMsg.style.display = 'none';
  }

  pinScreen.querySelectorAll('.pin-key').forEach(key => {
    key.addEventListener('click', () => {
      if (key.classList.contains('pin-empty')) return;
      if (key.classList.contains('pin-delete')) {
        pinInput = pinInput.slice(0, -1);
        updateDots();
        pinErrorMsg.style.display = 'none';
        return;
      }
      if (pinInput.length < 4) {
        pinInput += key.textContent;
        updateDots();
        if (pinInput.length === 4) {
          const storedPin = localStorage.getItem('user_pin') || '0000';
          if (pinInput === storedPin) {
            pinScreen.style.display = 'none';
            unlockApp();
          } else {
            pinErrorMsg.textContent = 'Неверный PIN-код';
            pinErrorMsg.style.display = 'block';
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

  // ==================== СМЕНА PIN ====================
  let newPinStep1 = '';
  let newPinStep2 = '';
  let isSettingNewPin = false;
  const changePinDots = document.getElementById('change-pin-dots');
  const changePinTitle = document.getElementById('change-pin-title');
  const changePinMessage = document.getElementById('change-pin-message');
  const changePinError = document.getElementById('change-pin-error');

  function updateChangeDots(val) {
    const dots = changePinDots.querySelectorAll('.pin-dot');
    dots.forEach((d, i) => d.classList.toggle('filled', i < val.length));
  }

  function resetChangePin() {
    newPinStep1 = '';
    newPinStep2 = '';
    isSettingNewPin = false;
    updateChangeDots('');
    changePinError.style.display = 'none';
    changePinTitle.textContent = 'Создайте PIN-код';
    changePinMessage.textContent = 'Придумайте 4 цифры';
  }

  changePinScreen.querySelectorAll('.pin-key').forEach(key => {
    key.addEventListener('click', () => {
      if (key.classList.contains('pin-empty')) return;
      if (key.classList.contains('pin-delete')) {
        if (isSettingNewPin) {
          newPinStep2 = newPinStep2.slice(0, -1);
          updateChangeDots(newPinStep2);
        } else {
          newPinStep1 = newPinStep1.slice(0, -1);
          updateChangeDots(newPinStep1);
        }
        changePinError.style.display = 'none';
        return;
      }

      if (!isSettingNewPin) {
        if (newPinStep1.length < 4) {
          newPinStep1 += key.textContent;
          updateChangeDots(newPinStep1);
          if (newPinStep1.length === 4) {
            isSettingNewPin = true;
            changePinTitle.textContent = 'Повторите PIN-код';
            changePinMessage.textContent = 'Введите те же 4 цифры';
            updateChangeDots('');
            changePinError.style.display = 'none';
          }
        }
      } else {
        if (newPinStep2.length < 4) {
          newPinStep2 += key.textContent;
          updateChangeDots(newPinStep2);
          if (newPinStep2.length === 4) {
            if (newPinStep1 === newPinStep2) {
              localStorage.setItem('user_pin', newPinStep1);
              changePinTitle.textContent = '✅ Готово!';
              changePinMessage.textContent = 'PIN-код обновлён';
              setTimeout(() => {
                changePinScreen.style.display = 'none';
                resetChangePin();
              }, 1000);
            } else {
              changePinError.textContent = 'PIN-коды не совпадают';
              changePinError.style.display = 'block';
              changePinDots.style.animation = 'shake 0.4s ease';
              setTimeout(() => {
                changePinDots.style.animation = '';
                newPinStep2 = '';
                updateChangeDots('');
              }, 400);
            }
          }
        }
      }
    });
  });

  document.getElementById('change-pin-cancel').addEventListener('click', () => {
    changePinScreen.style.display = 'none';
    resetChangePin();
  });

  // ==================== НАСТРОЙКИ ====================
  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
  });

  settingsCloseBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove('active');
  });

  changePinOpenBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
    resetChangePin();
    changePinScreen.style.display = 'flex';
  });

  // ==================== ЭКРАНЫ ====================
  function showPinScreen() {
    const email = localStorage.getItem('session_email') || '';
    pinUserEmail.textContent = email;
    authScreen.style.display = 'none';
    mainScreen.style.display = 'none';
    pinScreen.style.display = 'flex';
    resetPin();
  }

  function unlockApp() {
    pinScreen.style.display = 'none';
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

  // ==================== АВТОРИЗАЦИЯ ====================
  pinLogoutBtn.addEventListener('click', async () => {
    clearSession();
    await auth.signOut();
    pinScreen.style.display = 'none';
    authScreen.style.display = 'flex';
  });

  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const pass = passInput.value;
    if (!email || !pass) { showError('Введите email и пароль'); return; }
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

  registerBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const pass = passInput.value;
    if (!email || !pass) { showError('Введите email и пароль'); return; }
    if (pass.length < 6) { showError('Минимум 6 символов'); return; }
    try {
      await auth.createUserWithEmailAndPassword(email, pass);
      saveSession(email);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') showError('Этот email уже используется');
      else if (err.code === 'auth/invalid-email') showError('Неверный email');
      else showError(err.message);
    }
  });

  passInput.addEventListener('keypress', e => { if (e.key === 'Enter') loginBtn.click(); });
  logoutBtn.addEventListener('click', async () => { await auth.signOut(); });

  auth.onAuthStateChanged(user => {
    if (user) {
      showPinScreen();
    } else {
      authScreen.style.display = 'flex';
      pinScreen.style.display = 'none';
      changePinScreen.style.display = 'none';
      mainScreen.style.display = 'none';
      emailInput.value = savedEmail;
      passInput.value = '';
      authError.style.display = 'none';
      initialized = false;
      clearSession();
    }
  });
});
