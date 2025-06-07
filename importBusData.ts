import { importBusSchedulesBatch } from './services/busService';
import busScheduleData from './data/bus_schedule_route01.json';

async function importData() {
  try {
    console.log('Starting import of bus schedule data...');
    console.log(`Total schedules to import: ${busScheduleData.length}`);
    
    const result = await importBusSchedulesBatch(busScheduleData);
    
    if (result) {
      console.log(`Import completed successfully!`);
      console.log(`Imported: ${result.successful}/${result.total} schedules`);
    } else {
      console.log('Import failed');
    }
  } catch (error) {
    console.error('Error during import:', error);
  }
}

// Run the import
importData();
