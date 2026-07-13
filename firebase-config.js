const firebaseConfig = {
  apiKey: "AIzaSyB3aSMUWhzZvbL4b36mFwUiexgv1ozsgdc",
  authDomain: "myorganaizer24.firebaseapp.com",
  projectId: "myorganaizer24",
  storageBucket: "myorganaizer24.appspot.com",
  messagingSenderId: "1096135844588",
  appId: "1:1096135844588:web:6e2f3a8b4c5d7e9f0a1b2c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.log('Оффлайн-режим: открыто несколько вкладок');
    } else if (err.code === 'unimplemented') {
      console.log('Браузер не поддерживает оффлайн');
    }
  });

auth.signInAnonymously()
  .catch(err => console.error('Ошибка входа:', err));
