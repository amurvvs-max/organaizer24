document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM загружен');
  
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('Пользователь авторизован:', user.uid);
      
      console.log('Запуск навигации...');
      initNavigation();
      
      console.log('Запуск копилки...');
      initSavings();
      
      console.log('Запуск авто...');
      initCar();
      
      console.log('Запуск заметок...');
      initNotes();
      
      console.log('Всё инициализировано');
    } else {
      console.log('Пользователь НЕ авторизован');
    }
  });
});
