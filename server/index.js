require('dotenv').config();
const express = require('express');
const path = require('path');
const { supabase, seedIfEmpty } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Normalize Supabase snake_case → camelCase for the frontend
const normalize = (row) => {
  if (!row) return row;
  const { date_added, ...rest } = row;
  return { ...rest, dateAdded: date_added };
};

// Serve static files in local production mode (Vercel handles this in deployment)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// ── Stats ─────────────────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  const { count: totalWords, error: countError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  if (countError) return res.status(500).json({ error: countError.message });

  const { data: moduleData, error: modError } = await supabase
    .from('words')
    .select('module');

  if (modError) return res.status(500).json({ error: modError.message });

  const modules = new Set(moduleData.map((r) => r.module)).size;
  res.json({ totalWords, modules });
});

// ── Words ─────────────────────────────────────────────────────────────────────
app.get('/api/words', async (req, res) => {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .order('date_added', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(normalize));
});

app.post('/api/words', async (req, res) => {
  const { german, ukrainian, difficulty = 'medium', module: mod = 'General' } = req.body;
  if (!german?.trim() || !ukrainian?.trim()) {
    return res.status(400).json({ error: 'German and Ukrainian fields are required.' });
  }

  const { data, error } = await supabase
    .from('words')
    .insert({
      german: german.trim(),
      ukrainian: ukrainian.trim(),
      difficulty,
      module: mod.trim(),
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(normalize(data));
});

app.put('/api/words/:id', async (req, res) => {
  const { id } = req.params;
  const { german, ukrainian, difficulty, module: mod } = req.body;

  const { data: existing, error: findError } = await supabase
    .from('words')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !existing) return res.status(404).json({ error: 'Word not found.' });

  const { data, error } = await supabase
    .from('words')
    .update({
      german: german ?? existing.german,
      ukrainian: ukrainian ?? existing.ukrainian,
      difficulty: difficulty ?? existing.difficulty,
      module: mod ?? existing.module,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(normalize(data));
});

app.delete('/api/words/:id', async (req, res) => {
  const { error, count } = await supabase
    .from('words')
    .delete({ count: 'exact' })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  if (count === 0) return res.status(404).json({ error: 'Word not found.' });
  res.json({ success: true });
});

// ── Bulk import ───────────────────────────────────────────────────────────────
app.post('/api/words/bulk', async (req, res) => {
  const { words } = req.body;
  if (!Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: 'words array is required.' });
  }

  const valid = words
    .filter((w) => w.german?.trim() && w.ukrainian?.trim())
    .map((w) => ({
      german: w.german.trim(),
      ukrainian: w.ukrainian.trim(),
      difficulty: w.difficulty || 'medium',
      module: w.module || 'General',
    }));

  const { error } = await supabase.from('words').insert(valid);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ── SPA fallback (local only — Vercel serves dist/ directly) ──────────────────
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// ── Seed on module load (covers both local start and Vercel cold starts) ──────
seedIfEmpty().catch(console.error);

// ── Local dev server (not used on Vercel) ─────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
