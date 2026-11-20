require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');

const eventRoutes = require('./routes/events');
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  // Credentialed (cookie) requests cannot use '*', so echo the caller origin.
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  // Browsers block credentialed cross-site writes without a 2xx preflight.
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Versioned paths are canonical. Unversioned paths stay mounted so existing
// clients using the original API URL keep working.
for (const prefix of ['/api/v1/auth', '/auth']) {
  app.use(prefix, authRoutes);
}
for (const prefix of ['/api/v1/events', '/events']) {
  app.use(prefix, eventRoutes);
}
for (const prefix of ['/api/v1/attendance', '/attendance']) {
  app.use(prefix, attendanceRoutes);
}

app.use((error, req, res, _next) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong.';
  res.status(status).json({ message });
});

if (require.main === module) {
  app.listen(process.env.PORT || 8080);
}

module.exports = app;
