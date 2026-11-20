const { hash } = require('bcryptjs');
const { randomUUID } = require('node:crypto');

const { NotFoundError } = require('../util/errors');
const { readData, writeData } = require('./util');

async function add(data) {
  const storedData = await readData();
  const userId = randomUUID();
  const hashedPw = await hash(data.password, 12);
  if (!storedData.users) {
    storedData.users = [];
  }
  storedData.users.push({
    id: userId,
    email: data.email,
    password: hashedPw,
    joinedAt: new Date().toISOString(),
  });
  await writeData(storedData);
  return { id: userId, email: data.email };
}

// Public-safe projection. Password hashes never leave the data layer.
async function getAll() {
  const storedData = await readData();
  return (storedData.users || []).map(({ id, email, joinedAt }) => ({
    id,
    email,
    joinedAt: joinedAt || null,
  }));
}

async function get(email) {
  const storedData = await readData();
  if (!storedData.users || storedData.users.length === 0) {
    throw new NotFoundError('Could not find any users.');
  }

  const user = storedData.users.find((ev) => ev.email === email);
  if (!user) {
    throw new NotFoundError('Could not find user for email ' + email);
  }

  return user;
}

async function updatePassword(email, newPassword) {
  const storedData = await readData();
  const user = (storedData.users || []).find((u) => u.email === email);
  if (!user) {
    throw new NotFoundError('Could not find user for email ' + email);
  }
  user.password = await hash(newPassword, 12);
  await writeData(storedData);
}

exports.add = add;
exports.getAll = getAll;
exports.get = get;
exports.updatePassword = updatePassword;
