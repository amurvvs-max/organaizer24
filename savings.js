function initSavings() {
  const container = document.getElementById('savings-page');
  
  container.innerHTML = `
    <div class="savings-container">
      <div id="goals-list"></div>
      <button id="add-goal-btn" class="fab">+</button>
    </div>

    <div id="goal-modal" class="modal">
      <div class="modal-content">
        <h3 id="modal-title">Новая цель</h3>
        <input type="text" id="goal-name" placeholder="Название цели">
        <input type="number" id="goal-target" placeholder="Сумма цели (₽)">
        <input type="number" id="goal-amount" placeholder="Сумма пополнения (₽)" value="0">
        <textarea id="goal-note" placeholder="Заметка (необязательно)" rows="2"></textarea>
        <div class="modal-buttons">
          <button id="modal-cancel" class="btn-secondary">Отмена</button>
          <button id="modal-save" class="btn-primary">Сохранить</button>
        </div>
      </div>
    </div>

    <div id="quick-add" class="quick-add hidden">
      <div class="quick-add-buttons">
        <button data-amount="100">+100</button>
        <button data-amount="500">+500</button>
        <button data-amount="1000">+1000</button>
        <button data-amount="5000">+5000</button>
      </div>
      <input type="number" id="custom-amount" placeholder="Своя сумма">
      <button id="custom-add-btn" class="btn-primary">Добавить</button>
    </div>
  `;

  const goalsList = document.getElementById('goals-list');
  const addGoalBtn = document.getElementById('add-goal-btn');
  const modal = document.getElementById('goal-modal');
  const modalTitle = document.getElementById('modal-title');
  const goalName = document.getElementById('goal-name');
  const goalTarget = document.getElementById('goal-target');
  const goalAmount = document.getElementById('goal-amount');
  const goalNote = document.getElementById('goal-note');
  const modalCancel = document.getElementById('modal-cancel');
  const modalSave = document.getElementById('modal-save');
  const quickAdd = document.getElementById('quick-add');
  const customAmount = document.getElementById('custom-amount');
  const customAddBtn = document.getElementById('custom-add-btn');

  let currentGoalId = null;
  let goals = [];

  async function loadGoals() {
    goals = await getSavings();
    renderGoals();
  }

  function renderGoals() {
    if (goals.length === 0) {
      goalsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🐷</div>
          <p>Нет целей накоплений</p>
          <p class="empty-hint">Нажми + чтобы создать первую</p>
        </div>`;
      return;
    }

    goalsList.innerHTML = goals.map(goal => {
      const percent = Math.min((goal.current / goal.target) * 100, 100);
      const remaining = goal.target - goal.current;
      
      return `
        <div class="goal-card" data-id="${goal.id}">
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
              ? `Осталось накопить: ${formatMoney(remaining)} ₽` 
              : '✅ Цель достигнута!'}
          </p>
          ${goal.deposits && goal.deposits.length > 0 ? `
            <details class="deposits-history">
              <summary>История пополнений (${goal.deposits.length})</summary>
              <ul>
                ${goal.deposits.slice(-5).reverse().map(d => `
                  <li>
                    <span>+${formatMoney(d.amount)} ₽</span>
                    <span class="deposit-date">${formatDate(d.date)}</span>
                    ${d.note ? `<span class="deposit-note">${d.note}</span>` : ''}
                  </li>
                `).join('')}
              </ul>
            </details>
          ` : ''}
          <button class="btn-add-money" data-id="${goal.id}">💰 Пополнить</button>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.btn-add-money').forEach(btn => {
      btn.addEventListener('click', () => openQuickAdd(btn.dataset.id));
    });

    document.querySelectorAll('.delete-goal').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Удалить цель?')) {
          await deleteSavingGoal(btn.dataset.id);
          loadGoals();
        }
      });
    });
  }

  function openNewGoal() {
    currentGoalId = null;
    modalTitle.textContent = 'Новая цель';
    goalName.value = '';
    goalTarget.value = '';
    goalAmount.value = '0';
    goalNote.value = '';
    goalAmount.parentElement.style.display = 'none';
    modal.classList.add('active');
    goalName.focus();
  }

  function openQuickAdd(goalId) {
    currentGoalId = goalId;
    quickAdd.classList.remove('hidden');
    customAmount.value = '';
    customAmount.focus();
  }

  function closeQuickAdd() {
    quickAdd.classList.add('hidden');
    currentGoalId = null;
  }

  async function depositToGoal(amount) {
    if (!amount || amount <= 0) return;
    
    const goal = goals.find(g => g.id === currentGoalId);
    if (!goal) return;

    const deposits = goal.deposits || [];
    deposits.push({
      amount: amount,
      date: new Date().toISOString(),
      note: ''
    });

    await updateSavingGoal(currentGoalId, {
      current: (goal.current || 0) + amount,
      deposits: deposits
    });

    closeQuickAdd();
    loadGoals();
  }

  modalSave.addEventListener('click', async () => {
    const name = goalName.value.trim();
    const target = parseInt(goalTarget.value);
    const amount = parseInt(goalAmount.value) || 0;

    if (!name || !target) {
      alert('Введите название и сумму цели');
      return;
    }

    if (currentGoalId) {
      if (amount > 0) {
        await depositToGoal(amount);
      }
    } else {
      await addSavingGoal({
        name,
        target,
        current: amount,
        deposits: amount > 0 ? [{
          amount,
          date: new Date().toISOString(),
          note: goalNote.value.trim()
        }] : []
      });
    }

    modal.classList.remove('active');
    loadGoals();
  });

  modalCancel.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.querySelectorAll('.quick-add-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      depositToGoal(parseInt(btn.dataset.amount));
    });
  });

  customAddBtn.addEventListener('click', () => {
    depositToGoal(parseInt(customAmount.value));
  });

  customAmount.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') depositToGoal(parseInt(customAmount.value));
  });

  addGoalBtn.addEventListener('click', openNewGoal);

  quickAdd.addEventListener('click', (e) => {
    if (e.target === quickAdd) closeQuickAdd();
  });

  loadGoals();
}

function formatMoney(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}
