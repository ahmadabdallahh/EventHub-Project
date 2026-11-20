const { readStore, writeStore } = require('./util');

// Fixed demo roster. IDs are stable so QR codes stay valid across deploys.
const DEMO_USERS = [
  { id: 'demo-001', name: 'Layla Hassan', email: 'layla.hassan@demo.eventhub.local' },
  { id: 'demo-002', name: 'Omar Farouk', email: 'omar.farouk@demo.eventhub.local' },
  { id: 'demo-003', name: 'Maya Saleh', email: 'maya.saleh@demo.eventhub.local' },
  { id: 'demo-004', name: 'Karim Nabil', email: 'karim.nabil@demo.eventhub.local' },
  { id: 'demo-005', name: 'Sara Amin', email: 'sara.amin@demo.eventhub.local' },
  { id: 'demo-006', name: 'Youssef Magdy', email: 'youssef.magdy@demo.eventhub.local' },
  { id: 'demo-007', name: 'Dina Rami', email: 'dina.rami@demo.eventhub.local' },
  { id: 'demo-008', name: 'Hisham Adel', email: 'hisham.adel@demo.eventhub.local' },
  { id: 'demo-009', name: 'Reem Khalil', email: 'reem.khalil@demo.eventhub.local' },
  { id: 'demo-010', name: 'Tarek Fathy', email: 'tarek.fathy@demo.eventhub.local' },
];

function findUser(id) {
  return DEMO_USERS.find((user) => user.id === id);
}

async function listWithStatus() {
  const records = await readStore('attendance');
  return DEMO_USERS.map((user) => {
    const record = records[user.id];
    return {
      ...user,
      present: Boolean(record && record.checkedInAt),
      checkedInAt: (record && record.checkedInAt) || null,
    };
  });
}

// Idempotent: a second scan never overwrites the first check-in time.
async function checkIn(id) {
  const user = findUser(id);
  if (!user) {
    return null;
  }
  const records = await readStore('attendance');
  if (!records[id]) {
    records[id] = { checkedInAt: new Date().toISOString() };
    await writeStore('attendance', records);
  }
  return { ...user, ...records[id], present: true };
}

async function reset() {
  await writeStore('attendance', {});
}

exports.listWithStatus = listWithStatus;
exports.checkIn = checkIn;
exports.reset = reset;
