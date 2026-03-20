import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const MODULE_COLORS = {
  Greetings: '#3B82F6',
  Numbers: '#8B5CF6',
  Colors: '#EC4899',
  Food: '#10B981',
  Animals: '#F59E0B',
};
const modColor = (m) => MODULE_COLORS[m] || '#6B7280';

export default function SessionConfig({ navigate, SCREENS }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState('de-uk'); // 'de-uk' | 'uk-de'
  const [modules, setModules] = useState(new Set());
  const [difficulties, setDifficulties] = useState(new Set(['easy', 'medium', 'hard']));

  useEffect(() => {
    api.getWords().then((ws) => {
      setWords(ws);
      setModules(new Set(ws.map((w) => w.module)));
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

  const filtered = words.filter(
    (w) => modules.has(w.module) && difficulties.has(w.difficulty)
  );
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
            <div className="section-label">Modules</div>
            <div className="module-grid">
              {allModules.map((m) => {
                const checked = modules.has(m);
                return (
                  <div
                    key={m}
                    className={`module-chip ${checked ? 'checked' : ''}`}
                    style={{ color: checked ? modColor(m) : undefined }}
                    onClick={() => toggleModule(m)}
                  >
                    <div
                      className="module-chip-dot"
                      style={{ background: modColor(m) }}
                    />
                    {m}
                    <span className="module-check">✓</span>
                  </div>
                );
              })}
            </div>
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
