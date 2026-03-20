import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';

const MODULE_COLORS = {
  Greetings: '#3B82F6',
  Numbers: '#8B5CF6',
  Colors: '#EC4899',
  Food: '#10B981',
  Animals: '#F59E0B',
};
const modColor = (m) => MODULE_COLORS[m] || '#6B7280';

const DIFFS = ['easy', 'medium', 'hard'];

function Toast({ msg }) {
  return <div className="toast">{msg}</div>;
}

function parseCsv(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [german, ukrainian, difficulty, module] = l.split(',').map((s) => s.trim());
      return { german, ukrainian, difficulty: difficulty || 'medium', module: module || 'General' };
    })
    .filter((w) => w.german && w.ukrainian);
}

export default function WordManager({ navigate, SCREENS }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('dateAdded');
  const [sortDir, setSortDir] = useState('desc');
  const [editCell, setEditCell] = useState(null); // { id, field }
  const [editVal, setEditVal] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [newWord, setNewWord] = useState({ german: '', ukrainian: '', difficulty: 'medium', module: '' });
  const [bulkText, setBulkText] = useState('');
  const editInputRef = useRef(null);

  const refresh = () =>
    api.getWords().then((ws) => { setWords(ws); setLoading(false); });

  useEffect(() => { refresh(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // ── Sort & filter ──────────────────────────────────────────────────────────
  const modules = [...new Set(words.map((w) => w.module))].sort();

  const filtered = words
    .filter((w) => {
      const q = search.toLowerCase();
      return (
        !q ||
        w.german.toLowerCase().includes(q) ||
        w.ukrainian.toLowerCase().includes(q) ||
        w.module.toLowerCase().includes(q) ||
        w.difficulty.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av = a[sortKey] ?? '';
      let bv = b[sortKey] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── Inline edit ────────────────────────────────────────────────────────────
  const startEdit = (id, field, val) => {
    setEditCell({ id, field });
    setEditVal(String(val));
    setTimeout(() => editInputRef.current?.focus(), 30);
  };

  const commitEdit = async () => {
    if (!editCell) return;
    const { id, field } = editCell;
    const word = words.find((w) => w.id === id);
    if (!word || String(word[field]) === editVal) { setEditCell(null); return; }
    await api.updateWord(id, { [field]: editVal });
    await refresh();
    setEditCell(null);
    showToast('Word updated ✓');
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteWord = async (id) => {
    await api.deleteWord(id);
    setConfirmDelete(null);
    await refresh();
    showToast('Word deleted');
  };

  // ── Add new ────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newWord.german.trim() || !newWord.ukrainian.trim()) return;
    await api.addWord({ ...newWord, module: newWord.module || 'General' });
    setNewWord({ german: '', ukrainian: '', difficulty: 'medium', module: '' });
    setFormOpen(false);
    await refresh();
    showToast('Word added ✓');
  };

  // ── Bulk import ────────────────────────────────────────────────────────────
  const handleBulk = async () => {
    const parsed = parseCsv(bulkText);
    if (!parsed.length) { showToast('No valid rows found'); return; }
    await api.bulkImport(parsed);
    setBulkText('');
    setBulkOpen(false);
    await refresh();
    showToast(`Imported ${parsed.length} words ✓`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBulkText(ev.target.result);
    reader.readAsText(file);
  };

  const ThCol = ({ label, k }) => (
    <th className={sortKey === k ? 'sorted' : ''} onClick={() => toggleSort(k)}>
      {label}
      <span className="sort-arrow">{sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>
    </th>
  );

  const Cell = ({ word, field }) => {
    const isEditing = editCell?.id === word.id && editCell?.field === field;
    if (isEditing) {
      if (field === 'difficulty') {
        return (
          <td>
            <select
              className="cell-select"
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={commitEdit}
              autoFocus
            >
              {DIFFS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </td>
        );
      }
      return (
        <td>
          <input
            ref={editInputRef}
            className="cell-input"
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditCell(null); }}
          />
        </td>
      );
    }
    const val = word[field];
    if (field === 'difficulty') {
      return (
        <td>
          <span
            className={`badge badge-${val} cell-edit`}
            onClick={() => startEdit(word.id, field, val)}
          >{val}</span>
        </td>
      );
    }
    if (field === 'module') {
      return (
        <td>
          <span
            className="mod-badge cell-edit"
            style={{ background: modColor(val) }}
            onClick={() => startEdit(word.id, field, val)}
          >{val}</span>
        </td>
      );
    }
    if (field === 'dateAdded') {
      return <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{val?.slice(0, 10)}</td>;
    }
    return (
      <td>
        <span className="cell-edit" onClick={() => startEdit(word.id, field, val)}>
          {val}
        </span>
      </td>
    );
  };

  return (
    <div className="screen screen--wide manager-screen">
      <div className="back-header">
        <button className="back-btn" onClick={() => navigate(SCREENS.HOME)}>←</button>
        <div>
          <div className="page-title">Manage Words</div>
          <div className="page-subtitle">{words.length} words · click a cell to edit</div>
        </div>
      </div>

      {/* Add word */}
      <div className="card add-form-card">
        <div className="add-form-toggle" onClick={() => setFormOpen((o) => !o)}>
          <h3>+ Add New Word</h3>
          <span className={`toggle-icon ${formOpen ? 'open' : ''}`}>⌄</span>
        </div>
        {formOpen && (
          <div className="add-form-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">German</label>
                <input
                  className="input"
                  placeholder="e.g. Hund"
                  value={newWord.german}
                  onChange={(e) => setNewWord({ ...newWord, german: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ukrainian</label>
                <input
                  className="input"
                  placeholder="e.g. собака"
                  value={newWord.ukrainian}
                  onChange={(e) => setNewWord({ ...newWord, ukrainian: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select
                  className="input"
                  value={newWord.difficulty}
                  onChange={(e) => setNewWord({ ...newWord, difficulty: e.target.value })}
                >
                  {DIFFS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Module</label>
                <input
                  className="input"
                  placeholder="e.g. Animals or new name"
                  list="module-list"
                  value={newWord.module}
                  onChange={(e) => setNewWord({ ...newWord, module: e.target.value })}
                />
                <datalist id="module-list">
                  {modules.map((m) => <option key={m} value={m} />)}
                </datalist>
              </div>
            </div>
            <button
              className="btn btn-primary"
              disabled={!newWord.german.trim() || !newWord.ukrainian.trim()}
              onClick={handleAdd}
            >
              Save Word
            </button>
          </div>
        )}
      </div>

      {/* Bulk import */}
      <div className="card add-form-card">
        <div className="add-form-toggle" onClick={() => setBulkOpen((o) => !o)}>
          <h3>⇑ Bulk Import (CSV)</h3>
          <span className={`toggle-icon ${bulkOpen ? 'open' : ''}`}>⌄</span>
        </div>
        {bulkOpen && (
          <div className="add-form-body">
            <div className="bulk-hint">Format: <code>german, ukrainian, difficulty, module</code> — one per line</div>
            <textarea
              className="bulk-area"
              placeholder={'Hund, собака, easy, Animals\nKatze, кішка, easy, Animals'}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" disabled={!bulkText.trim()} onClick={handleBulk}>
                Import
              </button>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                📂 Upload CSV
                <input type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="manager-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="input search-input"
            placeholder="Search words, modules…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="no-words">
          {search ? 'No words match your search.' : 'No words yet — add some above!'}
        </div>
      ) : (
        <div className="words-table-wrap">
          <table className="words-table">
            <thead>
              <tr>
                <ThCol label="German" k="german" />
                <ThCol label="Ukrainian" k="ukrainian" />
                <ThCol label="Difficulty" k="difficulty" />
                <ThCol label="Module" k="module" />
                <ThCol label="Added" k="dateAdded" />
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((word) => (
                <tr key={word.id}>
                  <Cell word={word} field="german" />
                  <Cell word={word} field="ukrainian" />
                  <Cell word={word} field="difficulty" />
                  <Cell word={word} field="module" />
                  <Cell word={word} field="dateAdded" />
                  <td>
                    <div className="table-actions">
                      <button
                        className="del-btn"
                        title="Delete"
                        onClick={() => setConfirmDelete(word)}
                      >✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="dialog-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Word?</h3>
            <p>
              Remove <strong>{confirmDelete.german}</strong> / {confirmDelete.ukrainian}?
              This cannot be undone.
            </p>
            <div className="dialog-btns">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteWord(confirmDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} />}
    </div>
  );
}
