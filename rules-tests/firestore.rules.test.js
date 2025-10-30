import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-test-project',
    firestore: {
      rules: fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

test('hard delete is denied', async () => {
  const ctx = testEnv.unauthenticatedContext();
  const db = ctx.firestore();
  const ref = db.collection('leaves').doc('l1');
  await assertSucceeds(ref.set({ weekNumber: 1, year: 2025, month: 'Ocak', startDate: '1 Ocak', endDate: '6 Ocak', type: 'annual', pilots: [], approved: false }));
  await expect(assertFails(ref.delete())).resolves.toBeDefined();
});

test('immutable fields blocked on leaves', async () => {
  const ctx = testEnv.unauthenticatedContext();
  const db = ctx.firestore();
  const ref = db.collection('leaves').doc('l2');
  await assertSucceeds(ref.set({ weekNumber: 2, year: 2025, month: 'Ocak', startDate: '7 Ocak', endDate: '12 Ocak', type: 'annual', pilots: [], approved: false }));
  // Allowed update
  await assertSucceeds(ref.update({ pilots: ['A'] }));
  // Not allowed: change weekNumber
  await expect(assertFails(ref.update({ weekNumber: 3 }))).resolves.toBeDefined();
  // Not allowed: change year
  await expect(assertFails(ref.update({ year: 2026 }))).resolves.toBeDefined();
  // Not allowed: change type
  await expect(assertFails(ref.update({ type: 'summer' }))).resolves.toBeDefined();
});

test('audit append-only enforced', async () => {
  const ctx = testEnv.unauthenticatedContext();
  const db = ctx.firestore();
  const a = db.collection('leaves').doc('l3').collection('audit').doc('a1');
  await assertSucceeds(a.set({ ts: new Date(), changeType: 'update', actorName: 'X', humanLine: '...' }));
  await expect(assertFails(a.update({ humanLine: 'changed' }))).resolves.toBeDefined();
  await expect(assertFails(a.delete())).resolves.toBeDefined();
});

