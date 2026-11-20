const express = require('express');
const { checkAuth } = require('../util/auth');
const { listWithStatus, checkIn, reset } = require('../data/attendance');

const router = express.Router();

// Public roster so the scanner can resolve names and mark check-ins.
router.get('/users', async (_req, res, next) => {
  try {
    const users = await listWithStatus();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Public kiosk action: decoding a user's QR marks that user present.
router.post('/check-in', async (req, res, next) => {
  const id = req.body && req.body.userId;
  try {
    const user = await checkIn(id);
    if (!user) {
      return res.status(404).json({ message: 'Unknown attendance code.' });
    }
    res.json({ message: `${user.name} checked in.`, user });
  } catch (error) {
    next(error);
  }
});

// Clearing the board is an admin action.
router.post('/reset', checkAuth, async (_req, res, next) => {
  try {
    await reset();
    res.json({ message: 'Attendance reset.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
