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

  // Дожидаемся отрисовки DOM
  setTimeout(() => {
    const addGoalBtn = document.getElementById('add-goal-btn');
    const modal = document.getElementById('goal-modal');
    const modalCancel = document.getElementById('modal-cancel');

    console.log('addGoalBtn:', addGoalBtn);
    console.log('modal:', modal);

    if (addGoalBtn) {
      addGoalBtn.addEventListener('click', () => {
        console.log('Кнопка + нажата');
        modal.classList.add('active');
      });
    }

    if (modalCancel) {
      modalCancel.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    // Сохранение цели
    const modalSave = document.getElementById('modal-save');
    if (modalSave) {
      modalSave.addEventListener('click', async () => {
        const name = document.getElementById('goal-name').value.trim();
        const target = parseInt(document.getElementById('goal-target').value);
        const amount = parseInt(document.getElementById('goal-amount').value) || 0;

        if (!name || !target) {
          alert('Введите название и сумму цели');
          return;
        }

        await addSavingGoal({
          name,
          target,
          current: amount,
          deposits: amount > 0 ? [{
            amount,
            date: new Date().toISOString(),
            note: document.getElementById('goal-note').value.trim()
          }] : []
        });

        modal.classList.remove('active');
        loadGoals();
      });
    }

    // Загружаем цели
    loadGoals();
  }, 100);

  let goals = [];

  async function loadGoals() {
    goals = await getSavings();
    renderGoals();
  }

  function renderGoals() {
    const goalsList = document.getElementById('goals-list');
    if (!goalsList) return;

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
          <button class="btn-add-money quick-deposit" data-id="${goal.id}">💰 Пополнить</button>
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

    // Быстрое пополнение
    document.querySelectorAll('.quick-deposit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const quickAdd = document.getElementById('quick-add');
        quickAdd.classList.remove('hidden');
        
        const customAmount = document.getElementById('custom-amount');
        customAmount.value = '';
        customAmount.focus();

        // Обработчики для быстрых кнопок
        document.querySelectorAll('.quick-add-buttons button').forEach(qbtn => {
          qbtn.onclick = () => depositToGoal(id, parseInt(qbtn.dataset.amount));
        });

        document.getElementById('custom-add-btn').onclick = () => {
          depositToGoal(id, parseInt(customAmount.value));
        };

        customAmount.onkeypress = (e) => {
          if (e.key === 'Enter') depositToGoal(id, parseInt(customAmount.value));
        };
      });
    });
  }

  async function depositToGoal(goalId, amount) {
    if (!amount || amount <= 0) return;
    
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const deposits = goal.deposits || [];
    deposits.push({
      amount: amount,
      date: new Date().toISOString(),
      note: ''
    });

    await updateSavingGoal(goalId, {
      current: (goal.current || 0) + amount,
      deposits: deposits
    });

    document.getElementById('quick-add').classList.add('hidden');
    loadGoals();
  }
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
