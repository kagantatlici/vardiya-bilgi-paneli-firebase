import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../config/firebase';

export const callRevertLeave = async (auditPath: string, adminKey?: string) => {
  const functions = getFunctions(app);
  const fn = httpsCallable(functions, 'revertLeave');
  const key = adminKey || (typeof window !== 'undefined' ? localStorage.getItem('adminKey') || '' : '');
  const res = await fn({ auditPath, adminKey: key });
  return res.data;
};

export const callHideAudit = async (auditPath: string, adminKey?: string) => {
  const functions = getFunctions(app);
  const fn = httpsCallable(functions, 'hideAudit');
  const key = adminKey || (typeof window !== 'undefined' ? localStorage.getItem('adminKey') || '' : '');
  const res = await fn({ auditPath, adminKey: key });
  return res.data;
};
