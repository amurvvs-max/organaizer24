function initSavings() {
  const container = document.getElementById('savings-page');
  
  container.innerHTML = `
    <div class="savings-container">
      <div id="goals-list">
        <div class="empty-state">
          <div class="empty-icon">🐷</div>
          <p>Нет целей накоплений</p>
          <button id="open-goal-modal-btn" class="btn-primary" style="margin-top:16px; width:auto; display:inline-block; padding:12px 24px;">➕ Создать цель</button>
        </div>
      </div>

      <div id="goal-modal" class="modal">
        <div class="modal-content">
          <h3>Новая цель</h3>
          <input type="text" id="goal-name" placeholder="Название цели">
          <input type="number" id="goal-target" placeholder="Сумма цели (₽)">
          <div class="modal-buttons">
            <button id="goal-cancel" class="btn-secondary">Отмена</button>
            <button id="goal-save" class="btn-primary">Сохранить</button>
          </div>
        </div>
      </div>

      <div id="deposit-modal" class="modal">
        <div class="modal-content">
          <h3>Пополнить копилку</h3>
          <div class="quick-add-buttons">
            <button data-amount="100">+100 ₽</button>
            <button data-amount="500">+500 ₽</button>
            <button data-amount="1000">+1000 ₽</button>
            <button data-amount="5000">+5000 ₽</button>
          </div>
          <input type="number" id="deposit-amount" placeholder="Своя сумма">
          <div class="modal-buttons">
            <button id="deposit-cancel" class="btn-secondary">Отмена</button>
            <button id="deposit-save" class="btn-primary">Пополнить</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const goalModal = document.getElementById('goal-modal');
  const depositModal = document.getElementById('deposit-modal');
  let activeGoalId = null;

  // Открыть модалку создания цели
  document.addEventListener('click', (e) => {
    if (e.target.id === 'open-goal-modal-btn') {
      goalModal.classList.add('active');
    }
  });

  // Закрыть модалку цели
  document.getElementById('goal-cancel').addEventListener('click', () => {
    goalModal.classList.remove('active');
  });

  goalModal.addEventListener('click', (e) => {
    if (e.target === goalModal) goalModal.classList.remove('active');
  });

  // Сохранить цель
  document.getElementById('goal-save').addEventListener('click', async () => {
    const name = document.getElementById('goal-name').value.trim();
    const target = parseInt(document.getElementById('goal-target').value);

    if (!name || !target) {
      alert('Введите название и сумму');
      return;
    }

    await addSavingGoal({
      name: name,
      target: target,
      current: 0,
      deposits: []
    });

    goalModal.classList.remove('active');
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-target').value = '';
    loadGoals();
  });

  // Закрыть модалку пополнения
  document.getElementById('deposit-cancel').addEventListener('click', () => {
    depositModal.classList.remove('active');
  });

  depositModal.addEventListener('click', (e) => {
    if (e.target === depositModal) depositModal.classList.remove('active');
  });

  // Быстрые кнопки пополнения
  document.querySelectorAll('.quick-add-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('deposit-amount').value = btn.dataset.amount;
    });
  });

  // Сохранить пополнение
  document.getElementById('deposit-save').addEventListener('click', async () => {
    const amount = parseInt(document.getElementById('deposit-amount').value);
    
    if (!amount || amount <= 0) {
      alert('Введите сумму');
      return;
    }

    const goals = await getSavings();
    const goal = goals.find(g => g.id === activeGoalId);
    
    if (goal) {
      const deposits = goal.deposits || [];
      deposits.push({
        amount: amount,
        date: new Date().toISOString()
      });

      await updateSavingGoal(activeGoalId, {
        current: (goal.current || 0) + amount,
        deposits: deposits
      });
    }

    depositModal.classList.remove('active');
    document.getElementById('deposit-amount').value = '';
    loadGoals();
  });

  // Загрузка и отрисовка целей
  async function loadGoals() {
    const goals = await getSavings();
    const goalsList = document.getElementById('goals-list');

    if (goals.length === 0) {
      goalsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🐷</div>
          <p>Нет целей накоплений</p>
          <button id="open-goal-modal-btn" class="btn-primary" style="margin-top:16px; width:auto; display:inline-block; padding:12px 24px;">➕ Создать цель</button>
        </div>`;
      return;
    }

    goalsList.innerHTML = goals.map(goal => {
      const percent = Math.min((goal.current / goal.target) * 100, 100);
      const remaining = goal.target - goal.current;
      
      return `
        <div class="goal-card">
          <div class="goal-header">
            <h3>${goal.name}</h3>
            <button class="btn-icon delete-goal" data-id="${goal.id}">🗑️</button>
          </div>
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
            <span class="progress-text">${percent.toFixed(0)}%</span>
          </div>
          <div class="goal-amounts">
            <span>${formatMoney(goal.current)} ₽</span>
            <span>из ${formatMoney(goal.target)} ₽</span>
          </div>
          <p class="goal-remaining">
            ${remaining > 0 
              ? `Осталось: ${formatMoney(remaining)} ₽` 
              : '✅ Цель достигнута!'}
          </p>
          ${goal.deposits && goal.deposits.length > 0 ? `
            <details class="deposits-history">
              <summary>История (${goal.deposits.length})</summary>
              <ul>
                ${goal.deposits.slice(-5).reverse().map(d => `
                  <li>
                    <span>+${formatMoney(d.amount)} ₽</span>
                    <span class="deposit-date">${formatDate(d.date)}</span>
                  </li>
                `).join('')}
              </ul>
            </details>
          ` : ''}
          <div class="goal-buttons">
            <button class="btn-add-money deposit-btn" data-id="${goal.id}">💰 Пополнить</button>
            <button class="btn-add-money withdraw-btn" data-id="${goal.id}" style="border-color:#f44336; color:#f44336;">💸 Убавить</button>
          </div>
        </div>
      `;
    }).join('');

    // Удаление цели
    document.querySelectorAll('.delete-goal').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Удалить цель?')) {
          await deleteSavingGoal(btn.dataset.id);
          loadGoals();
        }
      });
    });

    // Пополнить
    document.querySelectorAll('.deposit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeGoalId = btn.dataset.id;
        document.getElementById('deposit-amount').value = '';
        document.querySelector('#deposit-modal h3').textContent = 'Пополнить копилку';
        document.getElementById('deposit-save').textContent = 'Пополнить';
        depositModal.classList.add('active');
      });
    });

    // Убавить
    document.querySelectorAll('.withdraw-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeGoalId = btn.dataset.id;
        document.getElementById('deposit-amount').value = '';
        document.querySelector('#deposit-modal h3').textContent = 'Убавить из копилки';
        document.getElementById('deposit-save').textContent = 'Убавить';
        depositModal.classList.add('active');
      });
    });
  }

  // Переопределяем сохранение с учётом убавления
  document.getElementById('deposit-save').addEventListener('click', async () => {
    const amount = parseInt(document.getElementById('deposit-amount').value);
    const isWithdraw = document.getElementById('deposit-save').textContent === 'Убавить';
    
    if (!amount || amount <= 0) {
      alert('Введите сумму');
      return;
    }

    const goals = await getSavings();
    const goal = goals.find(g => g.id === activeGoalId);
    
    if (goal) {
      const change = isWithdraw ? -amount : amount;
      const newCurrent = (goal.current || 0) + change;
      
      if (newCurrent < 0) {
        alert('Нельзя убавить больше, чем накоплено');
        return;
      }

      const deposits = goal.deposits || [];
      deposits.push({
        amount: change,
        date: new Date().toISOString()
      });

      await updateSavingGoal(activeGoalId, {
        current: newCurrent,
        deposits: deposits
      });
    }

    depositModal.classList.remove('active');
    document.getElementById('deposit-amount').value = '';
    loadGoals();
  }, { once: true }); // Удаляем старый обработчик

  // Начальная загрузка
  loadGoals();
}

function formatMoney(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long' 
  });
}
