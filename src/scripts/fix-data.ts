import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function fixCaptainsData() {
  console.log("Starting data fix...");
  const captainsRef = collection(db, 'captains');
  const snapshot = await getDocs(captainsRef);
  
  const docs = snapshot.docs.map(d => ({
    id: d.id,
    ref: doc(db, 'captains', d.id),
    ...d.data()
  })) as any[];

  console.log(`Found ${docs.length} total captain records.`);

  // 1. Delete blank rows
  const blankDocs = docs.filter(c => !c.isim && !c.sicilNo);
  console.log(`Found ${blankDocs.length} blank rows to delete.`);
  for (const b of blankDocs) {
    // Hard delete or soft delete
    console.log(`Hard deleting blank doc: ${b.id}`);
    await deleteDoc(b.ref);
  }

  // 2. Remove duplicates
  const nonBlankDocs = docs.filter(c => c.isim || c.sicilNo);
  const byName = new Map<string, any[]>();
  
  for (const c of nonBlankDocs) {
    const key = c.isim.trim();
    if (!byName.has(key)) {
      byName.set(key, []);
    }
    byName.get(key)!.push(c);
  }

  let deletedCount = 0;
  for (const [name, duplicates] of byName.entries()) {
    if (duplicates.length > 1) {
      console.log(`Found ${duplicates.length} records for ${name}. Keeping the first one and deleting the rest.`);
      // Keep the one that doesn't have 'deleted: true' if possible, or just the first one
      const toKeep = duplicates[0];
      const toDelete = duplicates.slice(1);
      for (const d of toDelete) {
        console.log(`Hard deleting duplicate doc: ${d.id} for ${name}`);
        await deleteDoc(d.ref);
        deletedCount++;
      }
    }
  }

  console.log(`Data fix completed. Deleted ${blankDocs.length} blank rows and ${deletedCount} duplicates.`);
}
