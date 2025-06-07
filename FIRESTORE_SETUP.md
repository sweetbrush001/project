# Firebase Firestore Setup and Data Import Guide

## Step 1: Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `bla-bla-b4bd5`
3. In the left sidebar, click on **"Firestore Database"**
4. Click **"Create database"**
5. Choose **"Start in test mode"** for development (allows read/write access for 30 days)
6. Select a location (choose the closest to your users, e.g., `asia-southeast1`)
7. Click **"Done"**

## Step 2: Set Up Firestore Security Rules (Optional - for production)

For development, test mode is fine. For production, update the rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to bus schedules
    match /busSchedules/{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Allow read access to bus routes
    match /busRoutes/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 3: Import Bus Schedule Data

After setting up Firestore, run the import script:

```bash
node importBusData.js
```

## Step 4: Verify Data Import

You can verify the import by:

1. Going to Firebase Console > Firestore Database
2. You should see a `busSchedules` collection with 366 documents
3. Each document should contain the bus schedule data structure

## Step 5: Using the Query Functions

Once the data is imported, you can use these functions in your app:

### Search by Origin and Destination
```typescript
import { searchBusSchedules } from './services/busService';

// Search for buses from Kandy to Colombo
const schedules = await searchBusSchedules('Kandy', 'Colombo Fort');
console.log('Found schedules:', schedules);
```

### Search by Route ID
```typescript
import { searchSchedulesByRoute } from './services/busService';

// Get all schedules for route 01
const schedules = await searchSchedulesByRoute('01');

// Get schedules for route 01 going from Kandy to Colombo
const kandyToColomboschedules = await searchSchedulesByRoute('01', 'Kandy_to_Colombo');
```

### Search by Operator
```typescript
import { getSchedulesByOperator } from './services/busService';

// Get all SLTB bus schedules
const sltbSchedules = await getSchedulesByOperator('SLTB');
```

## Data Structure

Each bus schedule document contains:

```typescript
interface BusSchedule {
  trip_id_raw: string;           // e.g., "SLTB", "C-1", "K-1"
  operator_type: string;         // e.g., "SLTB", "Private"
  route_id: string;              // e.g., "01"
  direction: string;             // e.g., "Kandy_to_Colombo"
  departure_time_origin: string; // e.g., "06:00"
  stops: BusStop[];             // Array of intermediate stops
  effective_date: string;        // e.g., "2020-02-12"
  origin_terminal: string;       // e.g., "Kandy"
  destination_terminal: string;  // e.g., "Colombo Fort"
  arrival_time_destination: string; // e.g., "10:10"
}

interface BusStop {
  name: string;                  // e.g., "Kegalle"
  arrival_time: string;          // e.g., "07:30"
}
```

## Troubleshooting

### Permission Denied Error
- Make sure Firestore is enabled in your Firebase project
- Check that you're using the correct project ID in your Firebase config
- Ensure security rules allow the operations you're trying to perform

### Import Script Not Working
- Make sure you have the `firebase` package installed: `npm install firebase`
- Verify your Firebase config is correct
- Check that the JSON file path is correct

### No Data Returned from Queries
- Verify the data was imported successfully in Firebase Console
- Check that you're using the correct field names in your queries
- Make sure the values you're searching for match exactly (case-sensitive)
