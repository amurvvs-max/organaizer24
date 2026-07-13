// Замени на свои ключи из Firebase Console
const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "ВАШ_ПРОЕКТ.firebaseapp.com",
  projectId: "ВАШ_PROJECT_ID",
  storageBucket: "ВАШ_ПРОЕКТ.appspot.com",
  messagingSenderId: "ВАШ_SENDER_ID",
  appId: "ВАШ_APP_ID"
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