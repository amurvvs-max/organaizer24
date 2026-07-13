// Нижняя навигация
function initNavigation() {
  const pages = ['savings', 'car', 'notes'];
  const icons = ['💰', '🚗', '📝'];

  // Показываем вкладку
  function showPage(page) {
    pages.forEach(p => {
      document.getElementById(`${p}-page`).style.display = p === page ? 'block' : 'none';
      document.getElementById(`nav-${p}`).classList.toggle('active', p === page);
    });
  }

  // Создаем меню
  const nav = document.getElementById('bottom-nav');
  pages.forEach((page, i) => {
    const btn = document.createElement('button');
    btn.id = `nav-${page}`;
    btn.innerHTML = `<span class="nav-icon">${icons[i]}</span>${page === 'savings' ? 'Копилка' : page === 'car' ? 'Авто' : 'Заметки'}`;
    btn.addEventListener('click', () => showPage(page));
    nav.appendChild(btn);
  });

  // Стартовая вкладка
  showPage('savings');
}