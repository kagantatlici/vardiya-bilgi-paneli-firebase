import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  setDoc,
  query, 
  orderBy,
  where,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { appendAuditForCaptain, appendAuditForLeave, formatHumanLineForCaptainFieldDeletion } from './audit';
import { getActorName } from './actor';

// Types
export interface Captain {
  id: string;
  sicilNo: string;
  isim: string;
  aisMobNo: string;
  aktifEhliyetler: string[];
  // Serbest metin not alanı (opsiyonel)
  notlar?: string;
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
    
    return snapshot.docs
      .map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Captain))
      .filter((c: any) => !c.deleted);
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
    try {
      await appendAuditForCaptain(docRef.id, 'create', getActorName(), Object.keys(captain), null);
    } catch (e) {
      console.warn('Captain audit(create) yazılamadı', e);
    }
    return docRef.id;
  }

  static async updateCaptain(id: string, updates: Partial<Captain>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    // Get previous snapshot for audit
    const prevSnap = await getDoc(docRef);
    const prev = prevSnap.exists() ? { id: prevSnap.id, ...prevSnap.data() } : null;
    const changedFields = Object.keys(updates || {});
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    try {
      // Detect simple field deletions for human line when string changed to empty
      let humanLine: string | undefined;
      if (prev && updates) {
        const deletedField = Object.keys(updates).find((k) => {
          const before = (prev as any)[k];
          const after = (updates as any)[k];
          return typeof before === 'string' && before && (after === '' || after === null || typeof after === 'undefined');
        });
        if (deletedField) {
          humanLine = formatHumanLineForCaptainFieldDeletion(getActorName(), deletedField);
        }
      }
      await appendAuditForCaptain(id, 'update', getActorName(), changedFields, prev, humanLine);
    } catch (e) {
      console.warn('Captain audit(update) yazılamadı', e);
    }
  }

  static async deleteCaptain(id: string): Promise<void> {
    // Soft delete instead of hard delete
    const docRef = doc(db, this.collectionName, id);
    const prevSnap = await getDoc(docRef);
    const prev = prevSnap.exists() ? { id: prevSnap.id, ...prevSnap.data() } : null;
    const actorName = getActorName();
    await updateDoc(docRef, {
      deleted: true,
      deletedAt: Timestamp.now(),
      deletedByName: actorName,
      updatedAt: Timestamp.now(),
    } as any);
    try {
      await appendAuditForCaptain(id, 'soft_delete', actorName, ['deleted'], prev);
    } catch (e) {
      console.warn('Captain audit(soft_delete) yazılamadı', e);
    }
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
    
    return snapshot.docs
      .map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeaveEntry))
      .filter((l: any) => !l.deleted);
  }

  static async getLeavesByYear(year: number): Promise<LeaveEntry[]> {
    const leavesRef = collection(db, this.collectionName);
    const q = query(leavesRef, where('year', '==', year), orderBy('weekNumber', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs
      .map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeaveEntry))
      .filter((l: any) => !l.deleted);
  }

  static async addLeave(leave: Omit<LeaveEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...leave,
      createdAt: now,
      updatedAt: now
    });
    try {
      const firstName = Array.isArray((leave as any).pilots)
        ? ((leave as any).pilots.find((p: string) => (p || '').trim()) || 'Boş').trim()
        : getActorName();
      await appendAuditForLeave(docRef.id, 'create', firstName || getActorName(), Object.keys(leave), null, leave);
    } catch (e) {
      console.warn('Leave audit(create) yazılamadı', e);
    }
    return docRef.id;
  }

  static async updateLeave(id: string, updates: Partial<LeaveEntry>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const prevSnap = await getDoc(docRef);
    const prev = prevSnap.exists() ? { id: prevSnap.id, ...prevSnap.data() } : null;
    const changedFields = Object.keys(updates || {});
    let humanLine: string | undefined;
    if (prev && updates && Array.isArray((updates as any).pilots)) {
      const prevPilots: string[] = Array.isArray((prev as any).pilots) ? (prev as any).pilots : [];
      const nextPilots: string[] = (updates as any).pilots as string[];
      const idx = nextPilots.findIndex((p, i) => (p || '').trim() !== ((prevPilots[i] || '').trim()));
      if (idx >= 0) {
        const prevOwner = (prevPilots[idx] || '').trim();
        const slotNo = idx + 1;
        const month = (updates as any).month ?? (prev as any).month;
        const startDate = (updates as any).startDate ?? (prev as any).startDate;
        const endDate = (updates as any).endDate ?? (prev as any).endDate;
        const weekNumber = (updates as any).weekNumber ?? (prev as any).weekNumber;
        const { formatHumanLineForLeave } = await import('./audit');
        const actor = getActorName();
        humanLine = formatHumanLineForLeave('update', actor || 'Boş', { weekNumber, month, startDate, endDate, prev, next: updates }, prevOwner || undefined, slotNo);
      }
    }
    try {
      await appendAuditForLeave(id, 'update', getActorName(), changedFields, prev, updates, humanLine);
    } catch (e) {
      console.warn('Leave audit(update) yazılamadı', e);
    }
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  static async deleteLeave(id: string): Promise<void> {
    // Soft delete instead of hard delete; also write audit
    const docRef = doc(db, this.collectionName, id);
    const prevSnap = await getDoc(docRef);
    const prev = prevSnap.exists() ? { id: prevSnap.id, ...prevSnap.data() } : null;
    const actorName = getActorName();
    await updateDoc(docRef, {
      deleted: true,
      deletedAt: Timestamp.now(),
      deletedByName: actorName,
      updatedAt: Timestamp.now(),
    } as any);
    try {
      await appendAuditForLeave(id, 'soft_delete', actorName, ['deleted'], prev, { deleted: true });
    } catch (e) {
      console.warn('Leave audit(soft_delete) yazılamadı', e);
    }
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
    const actorName = getActorName();
    const softDeletePromises = snapshot.docs.map(async d => {
      const prev = { id: d.id, ...d.data() };
      await updateDoc(d.ref, {
        deleted: true,
        deletedAt: Timestamp.now(),
        deletedByName: actorName,
        updatedAt: Timestamp.now(),
      } as any);
      try {
        await appendAuditForLeave(d.id, 'soft_delete', actorName, ['deleted'], prev, { deleted: true });
      } catch (e) {
        console.warn('Leave audit(soft_delete) yazılamadı', e);
      }
    });
    await Promise.all(softDeletePromises);
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
      const prev = { id: existingDoc.id, ...existingDoc.data() } as any;
      let humanLine: string | undefined;
      if (Array.isArray((leave as any).pilots)) {
        const prevPilots: string[] = Array.isArray((prev as any).pilots) ? (prev as any).pilots : [];
        const nextPilots: string[] = (leave as any).pilots as string[];
        const idx = nextPilots.findIndex((p, i) => (p || '').trim() !== ((prevPilots[i] || '').trim()));
        if (idx >= 0) {
          const prevOwner = (prevPilots[idx] || '').trim();
          const slotNo = idx + 1;
          const month = (leave as any).month ?? prev.month;
          const startDate = (leave as any).startDate ?? prev.startDate;
          const endDate = (leave as any).endDate ?? prev.endDate;
          const weekNumber = (leave as any).weekNumber ?? prev.weekNumber;
          const { formatHumanLineForLeave } = await import('./audit');
          const actor = getActorName();
          humanLine = formatHumanLineForLeave('update', actor || 'Boş', { weekNumber, month, startDate, endDate, prev, next: leave }, prevOwner || undefined, slotNo);
        }
      }
      try {
        await appendAuditForLeave(existingDoc.id, 'update', getActorName(), Object.keys(leave), prev, leave, humanLine);
      } catch (e) {
        console.warn('Leave audit(update) yazılamadı', e);
      }
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
