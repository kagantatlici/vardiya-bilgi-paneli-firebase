import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AdminSettings {
  adminKey: string;
  updatedAt?: any;
}

export class SettingsService {
  static async getAdminKey(): Promise<string | null> {
    const ref = doc(db, 'settings', 'admin');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as AdminSettings;
      return data.adminKey || null;
    }
    return null;
  }

  static async setAdminKey(adminKey: string): Promise<void> {
    const ref = doc(db, 'settings', 'admin');
    await setDoc(ref, { adminKey, updatedAt: new Date().toISOString() }, { merge: true });
  }
}

