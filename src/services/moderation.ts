import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const onHiddenAudits = (cb: (paths: Set<string>) => void) => {
  const ref = collection(db, 'settings', 'auditHidden', 'items');
  return onSnapshot(ref, (snap) => {
    const s = new Set<string>();
    snap.forEach((d) => {
      const p = (d.data() as any).path as string;
      if (p) s.add(p);
    });
    cb(s);
  });
};

