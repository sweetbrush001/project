const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, writeBatch, doc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiCClpM0o_hYBh2Z4LH7ai_FIQiyznOSs",
  authDomain: "bla-bla-b4bd5.firebaseapp.com",
  projectId: "bla-bla-b4bd5",
  storageBucket: "bla-bla-b4bd5.firebasestorage.app",
  messagingSenderId: "188179474554",
  appId: "1:188179474554:web:5b1a935bf04320252573c3",
  measurementId: "G-HGJHB5JS8K"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
const db = getFirestore(app);

async function importBusSchedules() {
  try {
    // Read the JSON file
    const dataPath = path.join(__dirname, 'data', 'bus_schedule_route02_fully_updated.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const schedules = JSON.parse(rawData);
    
    console.log('Starting import of bus schedule data...');
    console.log(`Total schedules to import: ${schedules.length}`);
    
    const batchSize = 500; // Firestore batch limit
    let successCount = 0;
    
    for (let i = 0; i < schedules.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchData = schedules.slice(i, i + batchSize);
      
      batchData.forEach((schedule) => {
        const docRef = doc(collection(db, 'busSchedules'));
        batch.set(docRef, schedule);
      });
      
      await batch.commit();
      successCount += batchData.length;
      console.log(`Batch ${Math.floor(i / batchSize) + 1} completed: ${successCount}/${schedules.length} schedules imported`);
    }
    
    console.log(`✅ Successfully imported ${successCount} bus schedules to Firestore!`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error importing bus schedule data:', error);
    process.exit(1);
  }
}

// Run the import
importBusSchedules();
