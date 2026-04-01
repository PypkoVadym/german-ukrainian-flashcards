import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const MODULE_COLORS = {
  Greetings: '#3B82F6',
  Numbers: '#8B5CF6',
  Colors: '#EC4899',
  Food: '#10B981',
  Animals: '#F59E0B',
  Travel: '#EF4444',
  Body: '#F97316',
  Clothes: '#14B8A6',
  Weather: '#06B6D4',
  Time: '#A855F7',
  Family: '#E11D48',
  Home: '#84CC16',
  Work: '#0EA5E9',
  Sports: '#FB923C',
  Nature: '#22C55E',
};

const FALLBACK_COLORS = [
  '#3B82F6','#8B5CF6','#EC4899','#10B981','#F59E0B',
  '#EF4444','#F97316','#14B8A6','#06B6D4','#A855F7',
  '#E11D48','#84CC16','#0EA5E9','#FB923C','#22C55E',
];

const modColor = (m, allModules) => {
  if (MODULE_COLORS[m]) return MODULE_COLORS[m];
  const idx = allModules.indexOf(m);
  return FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
};

export default function SessionConfig({ navigate, SCREENS }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState('de-uk'); // 'de-uk' | 'uk-de'
  const [modules, setModules] = useState(new Set());
  const [modulesOpen, setModulesOpen] = useState(false);
  const [difficulties, setDifficulties] = useState(new Set(['easy', 'medium', 'hard']));
  const [dateBatches, setDateBatches] = useState(new Set());

  useEffect(() => {
    api.getWords().then((ws) => {
      setWords(ws);
      setModules(new Set(ws.map((w) => w.module)));
      const dates = [...new Set(ws.map((w) => w.dateAdded?.slice(0, 10)))].filter(Boolean).sort();
      setDateBatches(new Set(dates));
      setLoading(false);
    });
  }, []);

  const allModules = [...new Set(words.map((w) => w.module))].sort();

  const toggleModule = (m) => {
    setModules((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  };

  const toggleDiff = (d) => {
    setDifficulties((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  const allDates = [...new Set(words.map((w) => w.dateAdded?.slice(0, 10)))].filter(Boolean).sort();

  const toggleDate = (d) => {
    setDateBatches((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  const filtered = words.filter((w) => {
    if (!modules.has(w.module)) return false;
    if (!difficulties.has(w.difficulty)) return false;
    if (!dateBatches.has(w.dateAdded?.slice(0, 10))) return false;
    return true;
  });
  const canStart = filtered.length >= 10;

  const startSession = () => {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const sessionWords = shuffled.slice(0, 10);
    navigate(SCREENS.SESSION, {
      config: { direction },
      words: sessionWords,
    });
  };

  return (
    <div className="screen config-screen">
      <div className="back-header">
        <button className="back-btn" onClick={() => navigate(SCREENS.HOME)}>←</button>
        <div>
          <div className="page-title">Configure Session</div>
          <div className="page-subtitle">Choose your study preferences</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          {/* Direction */}
          <div className="config-section">
            <div className="section-label">Translation Direction</div>
            <div className="direction-toggle">
              <button
                className={`direction-btn ${direction === 'de-uk' ? 'active' : ''}`}
                onClick={() => setDirection('de-uk')}
              >
                🇩🇪 German<br /><small>→ Translate to Ukrainian</small>
              </button>
              <button
                className={`direction-btn ${direction === 'uk-de' ? 'active' : ''}`}
                onClick={() => setDirection('uk-de')}
              >
                🇺🇦 Ukrainian<br /><small>→ Translate to German</small>
              </button>
            </div>
          </div>

          {/* Modules */}
          <div className="config-section">
            <button
              className="modules-dropdown-toggle"
              onClick={() => setModulesOpen((o) => !o)}
            >
              <span className="section-label" style={{ margin: 0 }}>Modules</span>
              <span className="modules-dropdown-meta">
                {modules.size}/{allModules.length} selected
                <span className={`modules-dropdown-arrow ${modulesOpen ? 'open' : ''}`}>▾</span>
              </span>
            </button>
            {modulesOpen && (
              <div className="module-grid">
                {allModules.map((m) => {
                  const checked = modules.has(m);
                  const color = modColor(m, allModules);
                  return (
                    <div
                      key={m}
                      className={`module-chip ${checked ? 'checked' : ''}`}
                      style={{ color: checked ? color : undefined }}
                      onClick={() => toggleModule(m)}
                    >
                      <div
                        className="module-chip-dot"
                        style={{ background: color }}
                      />
                      {m}
                      <span className="module-check">✓</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Difficulty */}
          <div className="config-section">
            <div className="section-label">Difficulty</div>
            <div className="difficulty-row">
              {['easy', 'medium', 'hard'].map((d) => {
                const checked = difficulties.has(d);
                return (
                  <div
                    key={d}
                    className={`diff-chip diff-chip-${d} ${checked ? 'checked' : ''}`}
                    onClick={() => toggleDiff(d)}
                  >
                    <span className="diff-check">✓</span>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Added */}
          <div className="config-section">
            <div className="section-label">Date Added</div>
            <div className="date-range-row">
              {allDates.map((d) => (
                <div
                  key={d}
                  className={`date-chip ${dateBatches.has(d) ? 'checked' : ''}`}
                  onClick={() => toggleDate(d)}
                >
                  {new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              ))}
            </div>
          </div>

          {/* Word count */}
          <div className={`word-count-bar ${!canStart ? 'warn' : ''}`}>
            {canStart
              ? `✓ ${filtered.length} words match — session will use 10 random words`
              : `⚠ Only ${filtered.length} words match (need at least 10). Adjust filters or add more words.`}
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            disabled={!canStart}
            onClick={startSession}
          >
            Start Session →
          </button>
        </>
      )}
    </div>
  );
}
