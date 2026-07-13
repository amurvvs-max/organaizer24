document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      initNavigation();
      initSavings();
      initCar();
      initNotes();
    }
  });
});
