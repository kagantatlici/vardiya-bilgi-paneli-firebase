import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

try {
  admin.initializeApp();
} catch {}

const db = admin.firestore();

export const revertLeave = functions.https.onCall(async (data, context) => {
  const auditPath: string = data?.auditPath || '';
  const m = auditPath.match(/^((leaves|captains)\/[A-Za-z0-9_-]+)\/audit\/[A-Za-z0-9_-]+$/);
  if (!auditPath || !m) {
    throw new functions.https.HttpsError('invalid-argument', 'Geçersiz auditPath');
  }

  const providedKey = (context.rawRequest?.headers?.['x-admin-key'] as string) || data?.adminKey || '';
  if (!providedKey) {
    throw new functions.https.HttpsError('permission-denied', 'Admin anahtarı eksik');
  }

  const settingsSnap = await db.doc('settings/admin').get();
  const currentKey = settingsSnap.exists ? settingsSnap.get('adminKey') : null;
  if (!currentKey || providedKey !== currentKey) {
    console.warn('Revert denied: invalid key');
    throw new functions.https.HttpsError('permission-denied', 'Geçersiz admin anahtarı');
  }

  const auditSnap = await db.doc(auditPath).get();
  if (!auditSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Audit kaydı bulunamadı');
  }
  const auditData = auditSnap.data() || {};
  const prevSnapshot = auditData.prevSnapshot;
  if (!prevSnapshot) {
    throw new functions.https.HttpsError('failed-precondition', 'Önceki görüntü bulunamadı');
  }

  const targetDocPath = m[1];
  const targetRef = db.doc(targetDocPath);

  await targetRef.set(prevSnapshot, { merge: false });

  const shortId = auditSnap.id.slice(0, 7);
  const humanLine = `${new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' })} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} Sistem, önceki değişikliği geri aldı (kaynak kayıt: ${shortId}).`;

  await targetRef.collection('audit').add({
    ts: admin.firestore.FieldValue.serverTimestamp(),
    clientTs: Date.now(),
    changeType: 'reverted',
    actorName: 'Sistem',
    changedFields: [],
    prevSnapshot: null,
    humanLine,
    targetPath: targetDocPath,
    revertedAuditId: auditSnap.id,
  });

  console.log('Revert successful for', auditPath);
  return { ok: true };
});

export const hideAudit = functions.https.onCall(async (data, context) => {
  const auditPath: string = data?.auditPath || '';
  const providedKey = (context.rawRequest?.headers?.['x-admin-key'] as string) || data?.adminKey || '';
  if (!auditPath) throw new functions.https.HttpsError('invalid-argument', 'auditPath gerekli');
  if (!providedKey) throw new functions.https.HttpsError('permission-denied', 'Admin anahtarı eksik');

  const settingsSnap = await db.doc('settings/admin').get();
  const currentKey = settingsSnap.exists ? settingsSnap.get('adminKey') : null;
  if (!currentKey || providedKey !== currentKey) {
    throw new functions.https.HttpsError('permission-denied', 'Geçersiz admin anahtarı');
  }

  const docId = auditPath.replace(/\//g, '__');
  await db.collection('settings').doc('auditHidden').collection('items').doc(docId).set({
    path: auditPath,
    hiddenAt: admin.firestore.FieldValue.serverTimestamp(),
    by: 'Sistem',
  }, { merge: true });

  return { ok: true };
});
