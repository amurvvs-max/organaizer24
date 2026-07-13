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
    </div>
  `;

  const modal = document.getElementById('goal-modal');
  const openBtn = document.getElementById('open-goal-modal-btn');
  const cancelBtn = document.getElementById('goal-cancel');
  const saveBtn = document.getElementById('goal-save');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  saveBtn.addEventListener('click', async () => {
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

    modal.classList.remove('active');
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-target').value = '';
    loadGoals();
  });

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
      document.getElementById('open-goal-modal-btn').addEventListener('click', () => {
        document.getElementById('goal-modal').classList.add('active');
      });
      return;
    }

    goalsList.innerHTML = goals.map(goal => {
      const percent = Math.min((goal.current / goal.target) * 100, 100);
      const remaining = goal.target - goal.current;
      
      return `
        <div class="goal-card">
          <div class="goal-header">
            <h3>${goal.name}</h3>
            <span>${percent.toFixed(0)}%</span>
          </div>
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
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
        </div>
      `;
    }).join('');
  }

  loadGoals();
}

function formatMoney(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
