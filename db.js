function getUserId() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(user => {
      if (user) resolve(user.uid);
    });
  });
}

// --- Копилка ---
async function getSavings() {
  const uid = await getUserId();
  const snapshot = await db.collection('users')
    .doc(uid).collection('savings').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addSavingGoal(goal) {
  const uid = await getUserId();
  return db.collection('users')
    .doc(uid).collection('savings').add(goal);
}

async function updateSavingGoal(id, data) {
  const uid = await getUserId();
  return db.collection('users')
    .doc(uid).collection('savings').doc(id).update(data);
}

async function deleteSavingGoal(id) {
  const uid = await getUserId();
  return db.collection('users')
    .doc(uid).collection('savings').doc(id).delete();
}

// --- Авто ---
async function getCars() {
  const uid = await getUserId();
  const snapshot = await db.collection('users')
    .doc(uid).collection('cars').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addCar(car) {
  const uid = await getUserId();
  return db.collection('users')
    .doc(uid).collection('cars').add(car);
}

async function updateCar(id, data) {
  const uid = await getUserId();
  return db.collection('users')
    .doc(uid).collection('cars').doc(id).update(data);
}

async function deleteCar(id) {
  const uid = await getUserId();
  return db.collection('users')
    .doc(uid).collection('cars').doc(id).delete();
}

// --- Заметки ---
async function getNotes() {
  const uid = await getUserId();
  const snapshot = await db.collection('users')
    .doc(uid).collection('notes')
    .orderBy('updatedAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addNote(note) {
  const uid = await getUserId();
  return db.collection('users')
    .doc(uid).collection('notes').add(note);
}

async function updateNote(id, data) {
  const uid = await getUserId();
  return db.collection('users')
    .doc(uid).collection('notes').doc(id).update(data);
}

async function deleteNote(id) {
  const uid = await getUserId();
  return db.collection('users')
    .doc(uid).collection('notes').doc(id).delete();
}
