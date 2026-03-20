const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// ── Stats ─────────────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const totalWords = db.prepare('SELECT COUNT(*) as c FROM words').get().c;
  const modules = db.prepare('SELECT COUNT(DISTINCT module) as c FROM words').get().c;
  res.json({ totalWords, modules });
});

// ── Words ─────────────────────────────────────────────────────────────────────
app.get('/api/words', (req, res) => {
  const words = db.prepare('SELECT * FROM words ORDER BY dateAdded DESC').all();
  res.json(words);
});

app.post('/api/words', (req, res) => {
  const { german, ukrainian, difficulty = 'medium', module: mod = 'General' } = req.body;
  if (!german?.trim() || !ukrainian?.trim()) {
    return res.status(400).json({ error: 'German and Ukrainian fields are required.' });
  }
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const result = db
    .prepare(
      'INSERT INTO words (german, ukrainian, difficulty, module, dateAdded) VALUES (?, ?, ?, ?, ?)'
    )
    .run(german.trim(), ukrainian.trim(), difficulty, mod.trim(), now);
  const word = db.prepare('SELECT * FROM words WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(word);
});

app.put('/api/words/:id', (req, res) => {
  const { id } = req.params;
  const { german, ukrainian, difficulty, module: mod } = req.body;
  const existing = db.prepare('SELECT * FROM words WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Word not found.' });
  db.prepare('UPDATE words SET german=?, ukrainian=?, difficulty=?, module=? WHERE id=?').run(
    german ?? existing.german,
    ukrainian ?? existing.ukrainian,
    difficulty ?? existing.difficulty,
    mod ?? existing.module,
    id
  );
  res.json(db.prepare('SELECT * FROM words WHERE id = ?').get(id));
});

app.delete('/api/words/:id', (req, res) => {
  const result = db.prepare('DELETE FROM words WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Word not found.' });
  res.json({ success: true });
});

// ── Bulk import ───────────────────────────────────────────────────────────────
app.post('/api/words/bulk', (req, res) => {
  const { words } = req.body;
  if (!Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: 'words array is required.' });
  }
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const insert = db.prepare(
    'INSERT INTO words (german, ukrainian, difficulty, module, dateAdded) VALUES (?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((list) => {
    for (const w of list) {
      if (w.german?.trim() && w.ukrainian?.trim()) {
        insert.run(w.german.trim(), w.ukrainian.trim(), w.difficulty || 'medium', w.module || 'General', now);
      }
    }
  });
  insertMany(words);
  res.json({ success: true });
});

// ── SPA fallback ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));
