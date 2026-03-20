import { useEffect, useRef, useState } from 'react';

function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#4F6EF7', '#FF9F43', '#22C55E', '#EC4899', '#8B5CF6', '#F59E0B', '#EF4444'];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -200 - 20,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      vr: (Math.random() - 0.5) * 0.15,
    }));

    let running = true;
    const loop = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.04;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      requestAnimationFrame(loop);
    };
    loop();

    const timeout = setTimeout(() => { running = false; }, 4000);
    return () => { running = false; clearTimeout(timeout); };
  }, []);

  return <canvas ref={canvasRef} className="confetti-canvas" />;
}

export default function Results({ navigate, SCREENS, results = [], config }) {
  const [displayScore, setDisplayScore] = useState(0);
  const correct = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const perfect = correct === total && total > 0;
  const isDeToUk = config?.direction !== 'uk-de';

  useEffect(() => {
    let count = 0;
    const step = () => {
      count++;
      setDisplayScore(count);
      if (count < correct) requestAnimationFrame(step);
    };
    if (correct > 0) setTimeout(() => requestAnimationFrame(step), 300);
  }, [correct]);

  const msgs = [
    'Keep practicing!',
    'Getting there!',
    'Good effort!',
    'Nice work!',
    'Great job!',
    'Excellent!',
    'Outstanding!',
    'Amazing!',
    'Fantastic!',
    'Almost perfect!',
    '🎉 Perfect score!',
  ];
  const msg = msgs[Math.min(correct, msgs.length - 1)];

  const tryAgain = () => {
    const reshuffled = [...results]
      .sort(() => Math.random() - 0.5)
      .map((r) => r.word);
    navigate(SCREENS.SESSION, { words: reshuffled });
  };

  return (
    <div className="screen results-screen">
      {perfect && <Confetti />}

      <div className="back-header" style={{ marginBottom: 20 }}>
        <button className="back-btn" onClick={() => navigate(SCREENS.HOME)}>←</button>
        <div>
          <div className="page-title">Session Complete</div>
          <div className="page-subtitle">Here's how you did</div>
        </div>
      </div>

      {/* Score hero */}
      <div className="score-hero">
        <div className={`score-ring ${perfect ? 'score-ring-perfect' : ''}`}>
          <div>
            <div className="score-number">{displayScore}<span className="score-denom">/{total}</span></div>
          </div>
        </div>
        <div className={`score-pct ${perfect ? 'score-pct-perfect' : ''}`}>{pct}%</div>
        <div className="score-msg">{msg}</div>
      </div>

      {/* Word-by-word breakdown */}
      <div className="section-label" style={{ marginBottom: 12 }}>Review</div>
      <div className="results-list">
        {results.map((r, i) => (
          <div
            className="result-row"
            key={i}
            style={{ animationDelay: `${0.1 + i * 0.05}s` }}
          >
            <div className="result-icon">{r.isCorrect ? '✅' : '❌'}</div>
            <div className="result-words">
              <div className="result-pair">
                <strong>{r.word.german}</strong>
                <span className="sep">—</span>
                <span>{r.word.ukrainian}</span>
              </div>
              {!r.isCorrect && (
                <div className="result-wrong">
                  You typed: <span>"{r.userAnswer}"</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="results-actions">
        <button className="btn btn-primary btn-lg btn-full" onClick={tryAgain}>
          🔁 Try Again
        </button>
        <button className="btn btn-secondary btn-full" onClick={() => navigate(SCREENS.CONFIG)}>
          New Session
        </button>
        <button className="btn btn-ghost btn-full" onClick={() => navigate(SCREENS.HOME)}>
          Home
        </button>
      </div>
    </div>
  );
}
