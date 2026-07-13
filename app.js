document.addEventListener('DOMContentLoaded', () => {
  // Ждем авторизацию, затем запускаем
  auth.onAuthStateChanged(user => {
    if (user) {
      initNavigation();
      initSavings();
      initCar();
      initNotes();
    }
  });
});