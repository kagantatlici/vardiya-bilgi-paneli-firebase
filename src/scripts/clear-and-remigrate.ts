import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { migrateFullShiftCalendar } from './migrate-full-shifts';

// Clear existing shifts and run full migration
export async function clearAndRemigrate() {
  try {
    // 1. Clear existing shifts
    const shiftsRef = collection(db, 'shifts');
    const snapshot = await getDocs(shiftsRef);
    
    const deletePromises = snapshot.docs.map(document => 
      deleteDoc(doc(db, 'shifts', document.id))
    );
    
    await Promise.all(deletePromises);
    
    // 2. Run full shift migration
    await migrateFullShiftCalendar();
    
    return { success: true, deletedCount: snapshot.docs.length };
  } catch (error) {
    throw error;
  }
}