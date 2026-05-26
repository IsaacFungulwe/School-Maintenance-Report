const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const errorHandler = require('./middleware/errorHandler');

const authRoutes      = require('./routes/auth');
const ticketRoutes    = require('./routes/tickets');
const noteRoutes      = require('./routes/notes');
const userRoutes      = require('./routes/users');
const locationRoutes  = require('./routes/locations');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/tickets',   ticketRoutes);
app.use('/api/tickets',   noteRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/locations', locationRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;