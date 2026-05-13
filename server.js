const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Simple visit counter stored in data/visits.json
const VISITS_FILE   = path.join(__dirname, 'data', 'visits.json');
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Initialise data files if missing
if (!fs.existsSync(VISITS_FILE))   writeJSON(VISITS_FILE,   { count: 0 });
if (!fs.existsSync(MESSAGES_FILE)) writeJSON(MESSAGES_FILE, []);

// Visit-counter middleware (counts every page load)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const v = readJSON(VISITS_FILE, { count: 0 });
    v.count += 1;
    writeJSON(VISITS_FILE, v);
  }
  next();
});

// ── Routes ──────────────────────────────────────────────────
const router = require('./routes/index');
app.use('/', router);

// ── 404 fallback ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(`
    <html><body style="background:#06090f;color:#b8d4e0;font-family:monospace;padding:4rem;text-align:center">
      <h1 style="color:#00b8d9">404</h1>
      <p>Page not found.</p>
      <a href="/" style="color:#e8620a">← Go Home</a>
    </body></html>
  `);
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
