// Замени на свои ключи из Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB3aSMUWhzZvbL4b36mFwUiexgv1ozsgdc",
  authDomain: "myorganaizer24.firebaseapp.com",
  projectId: "myorganaizer24",
  storageBucket: "myorganaizer24.firebasestorage.app",
  messagingSenderId: "460799288547",
  appId: "1:460799288547:web:f18fefa5a9330702c851d6"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Включаем оффлайн-кеширование
db.enablePersistence()
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.log('Оффлайн-режим: открыто несколько вкладок');
    } else if (err.code === 'unimplemented') {
      console.log('Браузер не поддерживает оффлайн');
    }
  });

// Анонимный вход (без регистрации, но у каждого свои данные)
auth.signInAnonymously()
  .catch(err => console.error('Ошибка входа:', err));
