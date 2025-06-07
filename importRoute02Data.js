const { initializeApp } = require('firebase/app');
const { getFirestore, collection, writeBatch, doc, getDocs, query, where } = require('firebase/firestore');
const fs = require('fs');

// Your Firebase config (corrected to match firebaseConfig.ts)
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importRoute02Data() {
  try {
    console.log('🚀 Starting Route 02 data import...');
    
    // Read the JSON file
    const jsonData = fs.readFileSync('./data/bus_schedule_route02_fully_updated.json', 'utf8');
    const schedules = JSON.parse(jsonData);
    
    console.log(`📊 Found ${schedules.length} schedules to import`);
    
    // Clean and validate data
    const validSchedules = schedules.filter(schedule => {
      // Filter out invalid entries
      if (!schedule || typeof schedule !== 'object') return false;
      if (!schedule.trip_id_raw || !schedule.origin_terminal || !schedule.destination_terminal) return false;
      if (!schedule.departure_time_origin || !schedule.arrival_time_destination) return false;
      
      // Clean up any corrupted data
      if (schedule.origin_terminal === 'ය' || schedule.destination_terminal === 'ය') {
        console.log(`⚠️  Skipping corrupted entry: ${schedule.trip_id_raw}`);
        return false;
      }
      
      // Ensure stops is an array
      if (!Array.isArray(schedule.stops)) {
        schedule.stops = [];
      }
      
      // Clean up stops array - remove invalid entries
      schedule.stops = schedule.stops.filter(stop => {
        return stop && typeof stop === 'object' && stop.name && stop.name.trim();
      });
      
      return true;
    });
    
    console.log(`✅ ${validSchedules.length} valid schedules after cleaning`);
    
    // Check if data already exists
    const existingQuery = query(
      collection(db, 'busSchedules'),
      where('route_id', '==', '02')
    );
    const existingDocs = await getDocs(existingQuery);
    
    if (existingDocs.size > 0) {
      console.log(`⚠️  Found ${existingDocs.size} existing Route 02 schedules. Deleting them first...`);
      
      // Delete existing Route 02 data in batches
      const deletePromises = [];
      let batch = writeBatch(db);
      let operationCount = 0;
      
      existingDocs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
        operationCount++;
        
        if (operationCount === 500) {
          deletePromises.push(batch.commit());
          batch = writeBatch(db);
          operationCount = 0;
        }
      });
      
      if (operationCount > 0) {
        deletePromises.push(batch.commit());
      }
      
      await Promise.all(deletePromises);
      console.log('🗑️  Existing Route 02 data deleted');
    }
    
    // Import new data in batches
    const batchSize = 500;
    let successCount = 0;
    
    for (let i = 0; i < validSchedules.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchData = validSchedules.slice(i, i + batchSize);
      
      batchData.forEach((schedule) => {
        const docRef = doc(collection(db, 'busSchedules'));
        
        // Clean up the data before adding
        const cleanSchedule = {
          trip_id_raw: schedule.trip_id_raw,
          operator_type: schedule.operator_type || 'Unknown',
          route_id: '02',
          direction: schedule.direction || '',
          origin_terminal: schedule.origin_terminal,
          departure_time_origin: schedule.departure_time_origin,
          stops: schedule.stops || [],
          destination_terminal: schedule.destination_terminal,
          arrival_time_destination: schedule.arrival_time_destination,
          effective_date: schedule.effective_date || '2021-03-01',
          notes: schedule.notes || ''
        };
        
        batch.set(docRef, cleanSchedule);
      });
      
      await batch.commit();
      successCount += batchData.length;
      console.log(`📦 Batch ${Math.floor(i / batchSize) + 1} completed: ${successCount}/${validSchedules.length} schedules imported`);
    }
    
    console.log(`🎉 Successfully imported ${successCount} Route 02 bus schedules!`);
    console.log(`📍 Route covers: Matara ↔ Colombo with ${validSchedules[0]?.stops?.length || 0}+ intermediate stops`);
    
    // Show some sample data
    const sampleSchedule = validSchedules.find(s => s.stops && s.stops.length > 0);
    if (sampleSchedule) {
      console.log(`🚌 Sample route: ${sampleSchedule.trip_id_raw} (${sampleSchedule.operator_type})`);
      console.log(`   ${sampleSchedule.origin_terminal} → ${sampleSchedule.destination_terminal}`);
      console.log(`   Departure: ${sampleSchedule.departure_time_origin}, Arrival: ${sampleSchedule.arrival_time_destination}`);
      console.log(`   Stops: ${sampleSchedule.stops.slice(0, 5).map(s => s.name).join(', ')}${sampleSchedule.stops.length > 5 ? '...' : ''}`);
    }
    
    return { successful: successCount, total: validSchedules.length };
    
  } catch (error) {
    console.error('❌ Error importing Route 02 data:', error);
    return null;
  }
}

// Run the import
importRoute02Data()
  .then(result => {
    if (result) {
      console.log(`\n✨ Import completed successfully!`);
      console.log(`📊 Final stats: ${result.successful}/${result.total} schedules imported`);
    } else {
      console.log('❌ Import failed');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
