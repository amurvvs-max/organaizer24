function initCar() {
  const container = document.getElementById('car-page');
  
  container.innerHTML = `
    <div class="car-container">
      <div id="car-data">
        <div class="empty-state">
          <div class="empty-icon">🚗</div>
          <p>Нет данных об автомобиле</p>
          <button id="add-car-btn" class="btn-primary" style="margin-top:16px; width:auto; display:inline-block; padding:12px 24px;">➕ Добавить данные</button>
        </div>
      </div>

      <div id="car-modal" class="modal">
        <div class="modal-content">
          <h3>Данные автомобиля</h3>
          <input type="text" id="car-brand" placeholder="Марка и модель">
          <input type="number" id="car-mileage" placeholder="Текущий пробег (км)">
          <input type="number" id="car-oil-mileage" placeholder="Пробег последней замены масла">
          <input type="date" id="car-oil-date" placeholder="Дата последней замены">
          <input type="number" id="car-oil-interval" placeholder="Интервал замены (км)" value="10000">
          <input type="text" id="car-oil-type" placeholder="Тип масла (например, 5W-30)">
          <div class="modal-buttons">
            <button id="car-cancel" class="btn-secondary">Отмена</button>
            <button id="car-save" class="btn-primary">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Кнопка открытия модалки
  const addCarBtn = document.getElementById('add-car-btn');
  const modal = document.getElementById('car-modal');
  const carCancel = document.getElementById('car-cancel');
  const carSave = document.getElementById('car-save');

  if (addCarBtn) {
    addCarBtn.addEventListener('click', () => {
      console.log('Кнопка "Добавить данные" нажата');
      modal.classList.add('active');
    });
  }

  if (carCancel) {
    carCancel.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  carSave.addEventListener('click', async () => {
    const brand = document.getElementById('car-brand').value;
    const mileage = parseInt(document.getElementById('car-mileage').value);
    const oilMileage = parseInt(document.getElementById('car-oil-mileage').value);
    const oilDate = document.getElementById('car-oil-date').value;
    const oilInterval = parseInt(document.getElementById('car-oil-interval').value) || 10000;
    const oilType = document.getElementById('car-oil-type').value;

    if (!brand || !mileage) {
      alert('Введите марку и пробег');
      return;
    }

    await saveCarData({
      brand,
      mileage,
      lastOilChange: {
        mileage: oilMileage || mileage,
        date: oilDate || new Date().toISOString().split('T')[0],
        type: oilType || 'Не указано'
      },
      oilInterval,
      history: []
    });

    modal.classList.remove('active');
    renderCarData();
  });

  async function renderCarData() {
    const data = await getCarData();
    const carDataDiv = document.getElementById('car-data');

    if (!data) {
      carDataDiv.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚗</div>
          <p>Нет данных об автомобиле</p>
          <button id="add-car-btn" class="btn-primary" style="margin-top:16px; width:auto; display:inline-block; padding:12px 24px;">➕ Добавить данные</button>
        </div>`;
      document.getElementById('add-car-btn').addEventListener('click', () => {
        document.getElementById('car-modal').classList.add('active');
      });
      return;
    }

    const oilChange = data.lastOilChange || {};
    const kmLeft = data.oilInterval - (data.mileage - oilChange.mileage);
    const oilDateObj = new Date(oilChange.date);
    const daysLeft = Math.ceil((oilDateObj.getTime() + data.oilInterval * 86400000 / 30 - Date.now()) / 86400000);

    carDataDiv.innerHTML = `
      <div class="goal-card">
        <h3>${data.brand}</h3>
        <p>Пробег: <strong>${formatMoney(data.mileage)} км</strong></p>
        
        <div style="margin-top:12px; padding:12px; background:#f9f9f9; border-radius:10px;">
          <p>🛢️ Последняя замена масла:</p>
          <p>${oilChange.date} — ${formatMoney(oilChange.mileage)} км</p>
          <p>Тип масла: ${oilChange.type}</p>
          <p>Интервал: ${formatMoney(data.oilInterval)} км</p>
          
          <div style="margin-top:8px;">
            ${kmLeft > 0 
              ? `<p style="color:#4CAF50;">✅ Осталось: ~${formatMoney(kmLeft)} км</p>`
              : `<p style="color:#f44336;">⚠️ Просрочено на ${formatMoney(Math.abs(kmLeft))} км!</p>`}
            <p style="font-size:12px; color:#888;">Примерно до: ${new Date(oilDateObj.getTime() + data.oilInterval * 86400000 / 30).toLocaleDateString('ru-RU')}</p>
          </div>
        </div>

        <button id="edit-car-btn" class="btn-add-money" style="margin-top:12px;">✏️ Редактировать</button>
      </div>
    `;

    document.getElementById('edit-car-btn').addEventListener('click', () => {
      document.getElementById('car-brand').value = data.brand;
      document.getElementById('car-mileage').value = data.mileage;
      document.getElementById('car-oil-mileage').value = oilChange.mileage;
      document.getElementById('car-oil-date').value = oilChange.date;
      document.getElementById('car-oil-interval').value = data.oilInterval;
      document.getElementById('car-oil-type').value = oilChange.type;
      modal.classList.add('active');
    });
  }

  renderCarData();
}
