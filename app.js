require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

// Updated paths to look inside the src/ folder
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes      = require('./src/routes/auth');
const ticketRoutes    = require('./src/routes/tickets');
const noteRoutes      = require('./src/routes/notes');
const userRoutes      = require('./src/routes/users');
const locationRoutes  = require('./src/routes/locations');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/tickets',   ticketRoutes);
//app.use('/api/tickets',   noteRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/locations', locationRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;