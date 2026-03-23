import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Home({ navigate, SCREENS }) {
  const [stats, setStats] = useState({ totalWords: '…', modules: '…' });

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-flags">
          <span>🇩🇪</span>
          <span className="flags-arrow">⇄</span>
          <span>🇺🇦</span>
        </div>
        <h1 className="home-title">Deutsch ↔ Українська</h1>
        <p className="home-subtitle">
          Learn German vocabulary with Ukrainian translations through interactive flashcards.
        </p>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalWords}</div>
          <div className="stat-label">Words</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.modules}</div>
          <div className="stat-label">Modules</div>
        </div>
      </div>

      <div className="home-actions">
        <button
          className="btn btn-primary btn-lg btn-full"
          onClick={() => navigate(SCREENS.CONFIG)}
        >
          <span>▶</span> Start Learning
        </button>
        <button
          className="btn btn-secondary btn-lg btn-full"
          onClick={() => navigate(SCREENS.MANAGE)}
        >
          <span>⊞</span> Manage Words
        </button>
      </div>
    </div>
  );
}
