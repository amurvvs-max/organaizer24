function initCar() {
  const container = document.getElementById('car-page');
  
  container.innerHTML = `
    <div class="car-container">
      <div id="car-content"></div>
      
      <button id="add-car-btn" class="fab">+</button>

      <div id="car-add-modal" class="modal">
        <div class="modal-content">
          <h3>Новый автомобиль</h3>
          <input type="text" id="car-brand" placeholder="Марка и модель">
          <input type="number" id="car-mileage" placeholder="Текущий пробег (км)">
          <input type="text" id="car-number" placeholder="Госномер (необязательно)">
          <div class="modal-buttons">
            <button id="car-add-cancel" class="btn-secondary">Отмена</button>
            <button id="car-add-save" class="btn-primary">Сохранить</button>
          </div>
        </div>
      </div>

      <div id="oil-modal" class="modal">
        <div class="modal-content">
          <h3>Замена масла</h3>
          <input type="number" id="oil-mileage" placeholder="Пробег на момент замены (км)">
          <input type="date" id="oil-date" placeholder="Дата замены">
          <input type="text" id="oil-type" placeholder="Масло (например, 5W-30)">
          <input type="text" id="oil-note" placeholder="Заметка (фильтр, сервис и т.д.)">
          <div class="modal-buttons">
            <button id="oil-cancel" class="btn-secondary">Отмена</button>
            <button id="oil-save" class="btn-primary">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  `;

  let currentCarId = null;
  let cars = [];

  // Кнопка +
  document.getElementById('add-car-btn').addEventListener('click', () => {
    document.getElementById('car-brand').value = '';
    document.getElementById('car-mileage').value = '';
    document.getElementById('car-number').value = '';
    document.getElementById('car-add-modal').classList.add('active');
  });

  // Добавление авто
  const carAddModal = document.getElementById('car-add-modal');
  
  document.getElementById('car-add-cancel').addEventListener('click', () => {
    carAddModal.classList.remove('active');
  });

  carAddModal.addEventListener('click', (e) => {
    if (e.target === carAddModal) carAddModal.classList.remove('active');
  });

  document.getElementById('car-add-save').addEventListener('click', async () => {
    const brand = document.getElementById('car-brand').value.trim();
    const mileage = parseInt(document.getElementById('car-mileage').value);
    const number = document.getElementById('car-number').value.trim();

    if (!brand || !mileage) {
      alert('Введите марку и пробег');
      return;
    }

    await addCar({
      brand,
      mileage,
      number,
      oilHistory: []
    });

    carAddModal.classList.remove('active');
    loadCars();
  });

  // Замена масла
  const oilModal = document.getElementById('oil-modal');

  document.getElementById('oil-cancel').addEventListener('click', () => {
    oilModal.classList.remove('active');
  });

  oilModal.addEventListener('click', (e) => {
    if (e.target === oilModal) oilModal.classList.remove('active');
  });

  document.getElementById('oil-save').addEventListener('click', async () => {
    const oilMileage = parseInt(document.getElementById('oil-mileage').value);
    const oilDate = document.getElementById('oil-date').value || new Date().toISOString().split('T')[0];
    const oilType = document.getElementById('oil-type').value.trim() || 'Не указано';
    const oilNote = document.getElementById('oil-note').value.trim();

    if (!oilMileage) {
      alert('Введите пробег');
      return;
    }

    const car = cars.find(c => c.id === currentCarId);
    if (car) {
      const oilHistory = car.oilHistory || [];
      oilHistory.push({
        mileage: oilMileage,
        date: oilDate,
        type: oilType,
        note: oilNote
      });

      oilHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

      await updateCar(currentCarId, {
        oilHistory,
        mileage: Math.max(car.mileage, oilMileage)
      });
    }

    oilModal.classList.remove('active');
    document.getElementById('oil-mileage').value = '';
    document.getElementById('oil-date').value = '';
    document.getElementById('oil-type').value = '';
    document.getElementById('oil-note').value = '';
    loadCars();
  });

  // Загрузка списка авто
  async function loadCars() {
    cars = await getCars();
    const carContent = document.getElementById('car-content');

    if (cars.length === 0) {
      carContent.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚗</div>
          <p>Нет автомобилей</p>
          <p class="empty-hint">Нажми + чтобы добавить</p>
        </div>`;
      return;
    }

    carContent.innerHTML = cars.map(car => {
      const oilHistory = car.oilHistory || [];
      const lastOil = oilHistory[0] || null;
      const nextOilMileage = lastOil ? lastOil.mileage + 10000 : car.mileage + 10000;
      const kmLeft = nextOilMileage - car.mileage;

      return `
        <div class="goal-card car-card">
          <div class="goal-header">
            <div>
              <h3>${car.brand}</h3>
              ${car.number ? `<p style="font-size:12px; color:#888;">${car.number}</p>` : ''}
            </div>
            <button class="btn-icon delete-car" data-id="${car.id}">🗑️</button>
          </div>

          <p style="font-size:14px; color:#666;">Пробег: <strong>${formatMoney(car.mileage)} км</strong></p>

          ${lastOil ? `
            <div style="margin-top:12px; padding:12px; background:#f9f9f9; border-radius:10px;">
              <p style="font-weight:500;">🛢️ Последняя замена:</p>
              <p>📅 ${formatDate(lastOil.date)} | 🔧 ${formatMoney(lastOil.mileage)} км</p>
              <p>🛢️ ${lastOil.type}</p>
              ${lastOil.note ? `<p style="font-size:12px; color:#888;">📝 ${lastOil.note}</p>` : ''}
              <p style="margin-top:8px; ${kmLeft > 0 ? 'color:#4CAF50;' : 'color:#f44336;'}">
                ${kmLeft > 0 
                  ? `✅ Следующая замена через ~${formatMoney(kmLeft)} км` 
                  : `⚠️ Замена просрочена на ${formatMoney(Math.abs(kmLeft))} км!`}
              </p>
            </div>
          ` : `
            <p style="margin-top:12px; color:#f44336;">Нет записей о замене масла</p>
          `}

          <button class="btn-add-money add-oil-btn" data-id="${car.id}" style="margin-top:12px;">🛢️ Замена масла</button>

          ${oilHistory.length > 1 ? `
            <details class="deposits-history" style="margin-top:12px;">
              <summary>История замен (${oilHistory.length})</summary>
              <ul>
                ${oilHistory.map(o => `
                  <li>
                    <span>📅 ${formatDate(o.date)}</span>
                    <span>🔧 ${formatMoney(o.mileage)} км</span>
                    <span>🛢️ ${o.type}</span>
                    ${o.note ? `<span style="font-size:11px; color:#888; width:100%;">📝 ${o.note}</span>` : ''}
                  </li>
                `).join('')}
              </ul>
            </details>
          ` : ''}
        </div>
      `;
    }).join('');

    // Удаление авто
    document.querySelectorAll('.delete-car').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Удалить автомобиль?')) {
          await deleteCar(btn.dataset.id);
          loadCars();
        }
      });
    });

    // Добавление замены масла
    document.querySelectorAll('.add-oil-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCarId = btn.dataset.id;
        const car = cars.find(c => c.id === currentCarId);
        document.getElementById('oil-mileage').value = car.mileage;
        document.getElementById('oil-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('oil-type').value = '';
        document.getElementById('oil-note').value = '';
        oilModal.classList.add('active');
      });
    });
  }

  loadCars();
}
