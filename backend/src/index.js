require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const tournamentRoutes = require('./routes/tournaments');
const matchRoutes      = require('./routes/matches');
const standingsRoutes  = require('./routes/standings');
const bracketRoutes    = require('./routes/bracket');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches',     matchRoutes);
app.use('/api/standings',   standingsRoutes);
app.use('/api/bracket',     bracketRoutes);

// ── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`MCSP Sport API running on http://localhost:${PORT}`);
});
