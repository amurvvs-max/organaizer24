function initNotes() {
  const container = document.getElementById('notes-page');
  
  container.innerHTML = `
    <div class="notes-container">
      <div id="notes-list"></div>
      
      <button id="add-note-btn" class="fab">+</button>

      <div id="note-modal" class="modal">
        <div class="modal-content">
          <h3 id="note-modal-title">Новая заметка</h3>
          <input type="text" id="note-title" placeholder="Заголовок">
          <textarea id="note-content" placeholder="Текст заметки..." rows="6" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; font-size:16px; font-family:inherit; resize:vertical;"></textarea>
          <div class="modal-buttons">
            <button id="note-cancel" class="btn-secondary">Отмена</button>
            <button id="note-save" class="btn-primary">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const noteModal = document.getElementById('note-modal');
  let editingNoteId = null;

  // Открыть модалку
  document.getElementById('add-note-btn').addEventListener('click', () => {
    editingNoteId = null;
    document.getElementById('note-modal-title').textContent = 'Новая заметка';
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    noteModal.classList.add('active');
  });

  // Закрыть
  document.getElementById('note-cancel').addEventListener('click', () => {
    noteModal.classList.remove('active');
  });

  noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) noteModal.classList.remove('active');
  });

  // Сохранить
  document.getElementById('note-save').addEventListener('click', async () => {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();

    if (!title) {
      alert('Введите заголовок');
      return;
    }

    if (editingNoteId) {
      await updateNote(editingNoteId, {
        title,
        content,
        updatedAt: new Date().toISOString()
      });
    } else {
      await addNote({
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    noteModal.classList.remove('active');
    loadNotes();
  });

  // Загрузка заметок
  async function loadNotes() {
    const notes = await getNotes();
    const notesList = document.getElementById('notes-list');

    if (notes.length === 0) {
      notesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p>Нет заметок</p>
          <p class="empty-hint">Нажми + чтобы создать</p>
        </div>`;
      return;
    }

    notesList.innerHTML = notes.map(note => {
      const preview = note.content 
        ? note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '') 
        : 'Нет текста';
      
      return `
        <div class="note-card" data-id="${note.id}">
          <div class="note-header">
            <h3>${note.title}</h3>
            <button class="btn-icon delete-note" data-id="${note.id}">🗑️</button>
          </div>
          <p class="note-preview">${preview}</p>
          <p class="note-date">${formatNoteDate(note.updatedAt)}</p>
          <button class="btn-add-money edit-note" data-id="${note.id}" style="margin-top:8px;">✏️ Редактировать</button>
        </div>
      `;
    }).join('');

    // Удаление
    document.querySelectorAll('.delete-note').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Удалить заметку?')) {
          await deleteNote(btn.dataset.id);
          loadNotes();
        }
      });
    });

    // Редактирование
    document.querySelectorAll('.edit-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const note = notes.find(n => n.id === btn.dataset.id);
        if (note) {
          editingNoteId = note.id;
          document.getElementById('note-modal-title').textContent = 'Редактировать';
          document.getElementById('note-title').value = note.title;
          document.getElementById('note-content').value = note.content || '';
          noteModal.classList.add('active');
        }
      });
    });
  }

  loadNotes();
}

function formatNoteDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = new Date();
  const diff = now - d;
  
  // Меньше минуты
  if (diff < 60000) return 'Только что';
  // Меньше часа
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин. назад`;
  // Сегодня
  if (d.toDateString() === now.toDateString()) return 'Сегодня';
  // Вчера
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
  
  return d.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
