import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export type ChangeType = 'create' | 'update' | 'soft_delete' | 'reverted';

export interface AuditEntryBase {
  ts: Timestamp;
  clientTs?: number;
  changeType: ChangeType;
  actorName: string;
  changedFields?: string[];
  humanLine: string;
  prevSnapshot?: any;
  // internal helpers
  targetPath: string; // e.g., leaves/{id} or captains/{id}
}

export interface LeaveAuditContext {
  weekNumber?: number;
  month?: string;
  startDate?: string;
  endDate?: string;
  prev?: any;
  next?: any;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
export const tsTr = (d: Date) => `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const weekLabelFrom = (ctx: LeaveAuditContext): string => {
  const s = ctx.startDate?.replace(/\s+/g, ' ').trim() || '';
  const e = ctx.endDate?.replace(/\s+/g, ' ').trim() || '';
  if (s && e) {
    const sDay = s.split(' ')[0];
    const eDay = e.split(' ')[0];
    const month = (ctx.month || '').trim();
    if (sDay && eDay && month) return `${sDay}–${eDay} ${month}`;
  }
  if (ctx.weekNumber) return `Hafta ${ctx.weekNumber}`;
  return 'İzin haftası';
};

export const formatHumanLineForLeave = (
  changeType: ChangeType,
  actorName: string,
  ctx: LeaveAuditContext,
  prevOwnerName?: string,
  slotNo?: number,
) => {
  const tsText = tsTr(new Date());
  const label = weekLabelFrom(ctx);
  if (changeType === 'soft_delete') {
    return `${tsText} ${actorName}, ${label} kaydını sildi.`;
  }
  if (changeType === 'reverted') {
    // This one is generated on server normally; keep here for symmetry
    return `${tsText} Sistem, önceki değişikliği geri aldı (kaynak kayıt: ?).`;
  }
  // Detect add to 1st slot
  const prevPilots: string[] = Array.isArray(ctx.prev?.pilots) ? ctx.prev.pilots : [];
  const nextPilots: string[] = Array.isArray(ctx.next?.pilots) ? ctx.next.pilots : [];
  const firstNonEmptyIndex = nextPilots.findIndex((p) => !!(p && p.trim()));
  if ((prevPilots.length === 0 || prevPilots.every(p => !p)) && firstNonEmptyIndex === 0) {
    return `${tsText} ${actorName}, ${label} izin haftası 1. sıraya izin ekledi.`;
  }
  // Detect replace at a slot
  if (typeof slotNo === 'number' && slotNo >= 1 && prevOwnerName) {
    return `${tsText} ${actorName}, ${label} izin haftası ${slotNo}. sıradaki izni (${prevOwnerName}) değiştirdi.`;
  }
  // Fallback
  return `${tsText} ${actorName}, ${label} üzerinde bir güncelleme yaptı.`;
};

export const formatHumanLineForCaptainFieldDeletion = (
  actorName: string,
  fieldName: string,
) => {
  const tsText = tsTr(new Date());
  return `${tsText} ${actorName}, kılavuz kaptan bilgilerinde ${fieldName} alanını sildi.`;
};

export const appendAuditForLeave = async (
  leaveId: string,
  changeType: ChangeType,
  actorName: string,
  changedFields: string[] | undefined,
  prevSnapshot: any,
  nextData: any,
  humanLine?: string,
) => {
  const ref = collection(db, 'leaves', leaveId, 'audit');
  await addDoc(ref, {
    ts: serverTimestamp(),
    clientTs: Date.now(),
    changeType,
    actorName,
    changedFields: changedFields || [],
    prevSnapshot: prevSnapshot || null,
    humanLine: humanLine || formatHumanLineForLeave(changeType, actorName, {
      weekNumber: prevSnapshot?.weekNumber ?? nextData?.weekNumber,
      month: prevSnapshot?.month ?? nextData?.month,
      startDate: prevSnapshot?.startDate ?? nextData?.startDate,
      endDate: prevSnapshot?.endDate ?? nextData?.endDate,
      prev: prevSnapshot,
      next: nextData,
    }),
    targetPath: `leaves/${leaveId}`,
  });
};

export const appendAuditForCaptain = async (
  captainId: string,
  changeType: ChangeType,
  actorName: string,
  changedFields: string[] | undefined,
  prevSnapshot: any,
  humanLine?: string,
) => {
  const ref = collection(db, 'captains', captainId, 'audit');
  await addDoc(ref, {
    ts: serverTimestamp(),
    clientTs: Date.now(),
    changeType,
    actorName,
    changedFields: changedFields || [],
    prevSnapshot: prevSnapshot || null,
    humanLine: humanLine || `${tsTr(new Date())} ${actorName}, kılavuz kaptan bilgilerinde bir güncelleme yaptı.`,
    targetPath: `captains/${captainId}`,
  });
};

export interface AuditFeedItem extends AuditEntryBase {
  id: string;
  path: string; // full path to audit doc
}

export const onAuditFeed = (
  limitCount: number,
  cb: (items: AuditFeedItem[]) => void,
) => {
  const q = query(collectionGroup(db, 'audit'), orderBy('ts', 'desc'), limit(limitCount));
  return onSnapshot(q, (snap) => {
    const items: AuditFeedItem[] = [];
    snap.forEach((d) => {
      items.push({
        id: d.id,
        path: d.ref.path,
        ...(d.data() as any),
      });
    });
    cb(items);
  });
};

export const getPrevSnapshot = async (path: string): Promise<any | null> => {
  const ref = doc(db, path);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
};
