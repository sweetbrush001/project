import { collection, query, where, getDocs, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface BusStop {
  name: string;
  arrival_time: string | null;
}

export interface BusSchedule {
  trip_id_raw: string;
  operator_type: string;
  route_id: string;
  direction: string;
  departure_time_origin: string;
  stops: BusStop[];
  effective_date: string;
  origin_terminal: string;
  destination_terminal: string;
  arrival_time_destination: string;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  busType: string;
}

export const searchBusRoutes = async (from: string, to: string): Promise<BusRoute[]> => {
  try {
    const busRoutesRef = collection(db, 'busRoutes');
    const q = query(
      busRoutesRef,
      where('from', '==', from),
      where('to', '==', to)
    );

    const querySnapshot = await getDocs(q);
    const routes: BusRoute[] = [];

    querySnapshot.forEach((doc) => {
      routes.push({ id: doc.id, ...doc.data() } as BusRoute);
    });

    return routes;
  } catch (error) {
    console.error('Error searching bus routes:', error);
    throw error;
  }
};

export const getPopularLocations = async (): Promise<string[]> => {
  try {
    // Get unique origin and destination terminals from Firestore
    const schedulesRef = collection(db, 'busSchedules');
    const querySnapshot = await getDocs(schedulesRef);
    
    const locationsSet = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as BusSchedule;
      locationsSet.add(data.origin_terminal);
      locationsSet.add(data.destination_terminal);
    });
    
    // Convert to array and sort
    const locations = Array.from(locationsSet).sort();
    
    // Return the locations, fallback to hardcoded list if no data
    return locations.length > 0 ? locations : [
      'Colombo',
      'Kandy',
      'Galle',
      'Jaffna',
      'Anuradhapura',
      'Negombo',
      'Trincomalee',
      'Batticaloa',
      'Matara',
      'Nuwara Eliya'
    ];
  } catch (error) {
    console.error('Error fetching popular locations:', error);
    // Return hardcoded popular locations in Sri Lanka as fallback
    return [
      'Colombo',
      'Kandy',
      'Galle',
      'Jaffna',
      'Anuradhapura',
      'Negombo',
      'Trincomalee',
      'Batticaloa',
      'Matara',
      'Nuwara Eliya'
    ];
  }
};

// Function to add a single bus schedule to Firestore
export const addBusSchedule = async (schedule: BusSchedule) => {
  try {
    const docRef = await addDoc(collection(db, 'busSchedules'), schedule);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    return null;
  }
};

// Function to bulk import bus schedules using batched writes (more efficient)
export const importBusSchedulesBatch = async (schedules: BusSchedule[]) => {
  try {
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
    
    console.log(`Successfully imported ${successCount} bus schedules`);
    return { successful: successCount, total: schedules.length };
  } catch (e) {
    console.error('Error importing bus schedule data:', e);
    return null;
  }
};

// Function to search bus schedules by origin and destination
export const searchBusSchedules = async (from: string, to: string): Promise<BusSchedule[]> => {
  try {
    const schedulesRef = collection(db, 'busSchedules');
    const q = query(
      schedulesRef,
      where('origin_terminal', '==', from),
      where('destination_terminal', '==', to)
    );

    const querySnapshot = await getDocs(q);
    const schedules: BusSchedule[] = [];

    querySnapshot.forEach((doc) => {
      schedules.push({ ...doc.data() } as BusSchedule);
    });

    // Sort by departure time
    schedules.sort((a, b) => {
      const timeA = a.departure_time_origin.split(':');
      const timeB = b.departure_time_origin.split(':');
      const minutesA = parseInt(timeA[0]) * 60 + parseInt(timeA[1]);
      const minutesB = parseInt(timeB[0]) * 60 + parseInt(timeB[1]);
      return minutesA - minutesB;
    });

    return schedules;
  } catch (error) {
    console.error('Error searching bus schedules:', error);
    throw error;
  }
};

// Function to search bus schedules with intermediate stop support
export const searchBusSchedulesEnhanced = async (from: string, to: string): Promise<BusSchedule[]> => {
  try {
    const schedulesRef = collection(db, 'busSchedules');
    
    // First, try direct route search
    const directQuery = query(
      schedulesRef,
      where('origin_terminal', '==', from),
      where('destination_terminal', '==', to)
    );
    
    const directResults = await getDocs(directQuery);
    const directSchedules: BusSchedule[] = [];
    directResults.forEach((doc) => {
      directSchedules.push({ ...doc.data() } as BusSchedule);
    });
    
    // If we have direct routes, return them sorted
    if (directSchedules.length > 0) {
      return sortSchedulesByTime(directSchedules);
    }
    
    // If no direct routes, search for routes that pass through both locations
    const allSchedulesQuery = query(schedulesRef);
    const allResults = await getDocs(allSchedulesQuery);
    const intermediateSchedules: BusSchedule[] = [];
    
    allResults.forEach((doc) => {
      const schedule = { ...doc.data() } as BusSchedule;
      
      // Check if this route serves both locations (origin -> stops -> destination)
      const fromFound = schedule.origin_terminal === from || 
        schedule.stops?.some(stop => stop.name === from);
      const toFound = schedule.destination_terminal === to || 
        schedule.stops?.some(stop => stop.name === to);
        
      // Also check for partial name matches for common variations
      const fromPartialFound = schedule.origin_terminal.toLowerCase().includes(from.toLowerCase()) ||
        schedule.stops?.some(stop => stop.name.toLowerCase().includes(from.toLowerCase()));
      const toPartialFound = schedule.destination_terminal.toLowerCase().includes(to.toLowerCase()) ||
        schedule.stops?.some(stop => stop.name.toLowerCase().includes(to.toLowerCase()));
      
      if ((fromFound || fromPartialFound) && (toFound || toPartialFound)) {
        // Ensure the route goes in the correct direction
        const fromIndex = getStopIndex(schedule, from);
        const toIndex = getStopIndex(schedule, to);
        
        if (fromIndex < toIndex) {
          intermediateSchedules.push(schedule);
        }
      }
    });
    
    return sortSchedulesByTime(intermediateSchedules);
  } catch (error) {
    console.error('Error in enhanced bus schedule search:', error);
    throw error;
  }
};

// Helper function to get the index of a stop in the route
const getStopIndex = (schedule: BusSchedule, location: string): number => {
  if (schedule.origin_terminal === location || 
      schedule.origin_terminal.toLowerCase().includes(location.toLowerCase())) {
    return -1; // Origin is before all stops
  }
  
  if (schedule.destination_terminal === location || 
      schedule.destination_terminal.toLowerCase().includes(location.toLowerCase())) {
    return (schedule.stops?.length || 0) + 1; // Destination is after all stops
  }
  
  // Find in intermediate stops
  const stopIndex = schedule.stops?.findIndex(stop => 
    stop.name === location || stop.name.toLowerCase().includes(location.toLowerCase())
  );
  
  return stopIndex !== undefined && stopIndex >= 0 ? stopIndex : 999; // If not found, put at end
};

// Helper function to sort schedules by departure time
const sortSchedulesByTime = (schedules: BusSchedule[]): BusSchedule[] => {
  return schedules.sort((a, b) => {
    const timeA = a.departure_time_origin.split(':');
    const timeB = b.departure_time_origin.split(':');
    const minutesA = parseInt(timeA[0]) * 60 + parseInt(timeA[1]);
    const minutesB = parseInt(timeB[0]) * 60 + parseInt(timeB[1]);
    return minutesA - minutesB;
  });
};

// Function to get all unique locations (terminals + intermediate stops)
export const getAllLocations = async (): Promise<string[]> => {
  try {
    const schedulesRef = collection(db, 'busSchedules');
    const querySnapshot = await getDocs(schedulesRef);
    
    const locationsSet = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as BusSchedule;
      
      // Add origin and destination
      locationsSet.add(data.origin_terminal);
      locationsSet.add(data.destination_terminal);
      
      // Add all intermediate stops
      data.stops?.forEach(stop => {
        if (stop.name && stop.name.trim()) {
          locationsSet.add(stop.name);
        }
      });
    });
    
    // Convert to array, filter out empty strings, and sort
    const locations = Array.from(locationsSet)
      .filter(location => location && location.trim())
      .sort();
    
    return locations;
  } catch (error) {
    console.error('Error fetching all locations:', error);
    return [];
  }
};

// Function to get schedules by operator type
export const getSchedulesByOperator = async (operatorType: string): Promise<BusSchedule[]> => {
  try {
    const schedulesRef = collection(db, 'busSchedules');
    const q = query(schedulesRef, where('operator_type', '==', operatorType));

    const querySnapshot = await getDocs(q);
    const schedules: BusSchedule[] = [];

    querySnapshot.forEach((doc) => {
      schedules.push({ ...doc.data() } as BusSchedule);
    });

    return schedules;
  } catch (error) {
    console.error('Error getting schedules by operator:', error);
    throw error;
  }
};