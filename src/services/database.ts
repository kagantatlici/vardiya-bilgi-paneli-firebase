import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  orderBy,
  where,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export interface Captain {
  id: string;
  sicilNo: string;
  isim: string;
  aisMobNo: string;
  aktifEhliyetler: string[];
  tumEhliyetler: {
    istanbul: boolean;
    canakkale: boolean;
    hpasa: boolean;
    kepez: boolean;
    izmir: boolean;
    mersin: boolean;
    zonguldak: boolean;
  };
  melbusat: {
    pantolon: string;
    gomlek: string;
    tshirt: string;
    yelek: string;
    polar: string;
    mont: string;
    ayakkabi: string;
  };
  durum: "Aktif" | "Pasif";
  siraNo: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LeaveEntry {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  year: number;
  month: string;
  pilots: string[];
  approved: boolean;
  type: "summer" | "annual";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ShiftData {
  id: string;
  date: string;
  shiftNumber: number;
  year: number;
  month: number;
  day: number;
}

// Captain Service
export class CaptainService {
  private static collectionName = 'captains';

  static async getAllCaptains(): Promise<Captain[]> {
    const captainsRef = collection(db, this.collectionName);
    const q = query(captainsRef, orderBy('siraNo', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Captain));
  }

  static async getCaptain(id: string): Promise<Captain | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Captain;
    }
    return null;
  }

  static async addCaptain(captain: Omit<Captain, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...captain,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }

  static async updateCaptain(id: string, updates: Partial<Captain>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  static async deleteCaptain(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  static async updateCaptainOrder(captains: Captain[]): Promise<void> {
    const batch = [];
    for (let i = 0; i < captains.length; i++) {
      const captain = captains[i];
      batch.push(
        this.updateCaptain(captain.id, { siraNo: i + 1 })
      );
    }
    await Promise.all(batch);
  }

  // Real-time listener
  static onCaptainsChange(callback: (captains: Captain[]) => void): () => void {
    const captainsRef = collection(db, this.collectionName);
    const q = query(captainsRef, orderBy('siraNo', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const captains = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Captain));
      callback(captains);
    });
  }
}

// Leave Service
export class LeaveService {
  private static collectionName = 'leaves';

  static async getAllLeaves(): Promise<LeaveEntry[]> {
    const leavesRef = collection(db, this.collectionName);
    const q = query(leavesRef, orderBy('year', 'asc'), orderBy('weekNumber', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeaveEntry));
  }

  static async getLeavesByYear(year: number): Promise<LeaveEntry[]> {
    const leavesRef = collection(db, this.collectionName);
    const q = query(leavesRef, where('year', '==', year), orderBy('weekNumber', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeaveEntry));
  }

  static async addLeave(leave: Omit<LeaveEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...leave,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }

  static async updateLeave(id: string, updates: Partial<LeaveEntry>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  static async deleteLeave(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  static async deleteLeaveByWeekAndYear(weekNumber: number, year: number, type: 'summer' | 'annual'): Promise<void> {
    const leavesRef = collection(db, this.collectionName);
    const q = query(
      leavesRef,
      where('year', '==', year),
      where('weekNumber', '==', weekNumber),
      where('type', '==', type)
    );
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  static async upsertLeave(leave: Omit<LeaveEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Check if a record already exists for this week/year/type
    const leavesRef = collection(db, this.collectionName);
    const q = query(
      leavesRef,
      where('year', '==', leave.year),
      where('weekNumber', '==', leave.weekNumber),
      where('type', '==', leave.type)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // No existing record, create new one
      return await this.addLeave(leave);
    } else {
      // Update existing record
      const existingDoc = snapshot.docs[0];
      await updateDoc(existingDoc.ref, {
        ...leave,
        updatedAt: Timestamp.now()
      });
      return existingDoc.id;
    }
  }

  static async batchUpsertLeaves(leaves: Omit<LeaveEntry, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
    const results: string[] = [];
    
    // Process in batches of 10 to avoid Firestore limits
    const batchSize = 10;
    for (let i = 0; i < leaves.length; i += batchSize) {
      const batch = leaves.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(leave => this.upsertLeave(leave))
      );
      results.push(...batchResults);
    }
    
    return results;
  }
}

// Shift Service
export class ShiftService {
  private static collectionName = 'shifts';

  static async getAllShifts(): Promise<ShiftData[]> {
    const shiftsRef = collection(db, this.collectionName);
    const q = query(shiftsRef, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ShiftData));
  }

  static async getShiftByDate(date: string): Promise<ShiftData | null> {
    const docRef = doc(db, this.collectionName, date);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ShiftData;
    }
    return null;
  }

  static async addShift(shift: ShiftData): Promise<void> {
    const docRef = doc(db, this.collectionName, shift.date);
    await setDoc(docRef, shift);
  }

  static async bulkAddShifts(shifts: ShiftData[]): Promise<void> {
    const batch = shifts.map(shift => 
      this.addShift(shift)
    );
    await Promise.all(batch);
  }
}