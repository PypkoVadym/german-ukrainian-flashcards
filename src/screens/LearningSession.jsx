import { useState, useEffect, useRef, useCallback } from 'react';

const MODULE_COLORS = {
  Greetings: '#3B82F6',
  Numbers: '#8B5CF6',
  Colors: '#EC4899',
  Food: '#10B981',
  Animals: '#F59E0B',
};
const modColor = (m) => MODULE_COLORS[m] || '#6B7280';

export default function LearningSession({ navigate, SCREENS, words, config }) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [cardState, setCardState] = useState('entering'); // entering | idle | correct | incorrect | exiting
  const [wrongReveal, setWrongReveal] = useState(null);
  const [results, setResults] = useState([]);
  const [showExit, setShowExit] = useState(false);
  const inputRef = useRef(null);

  const current = words[index];
  const isDeToUk = config?.direction !== 'uk-de';
  const prompt = current ? (isDeToUk ? current.german : current.ukrainian) : '';
  const answer = current ? (isDeToUk ? current.ukrainian : current.german) : '';

  useEffect(() => {
    setCardState('entering');
    setInput('');
    setWrongReveal(null);
    const t = setTimeout(() => setCardState('idle'), 400);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (cardState === 'idle') {
      inputRef.current?.focus();
    }
  }, [cardState]);

  const submit = useCallback(() => {
    if (cardState !== 'idle' || !input.trim()) return;

    const userAnswer = input.trim().toLowerCase();
    const correct = answer.trim().toLowerCase();
    const isCorrect = userAnswer === correct;

    setResults((prev) => [
      ...prev,
      { word: current, userAnswer: input.trim(), isCorrect },
    ]);

    if (isCorrect) {
      setCardState('correct');
      setTimeout(() => {
        setCardState('exiting');
        setTimeout(() => {
          if (index + 1 >= words.length) {
            navigate(SCREENS.RESULTS, {
              results: [
                ...results,
                { word: current, userAnswer: input.trim(), isCorrect: true },
              ],
            });
          } else {
            setIndex((i) => i + 1);
          }
        }, 280);
      }, 1200);
    } else {
      setCardState('incorrect');
      setWrongReveal(input.trim());
      setTimeout(() => setCardState('idle'), 500);
    }
  }, [cardState, input, answer, current, index, words, results, navigate, SCREENS]);

  const next = () => {
    setCardState('exiting');
    setTimeout(() => {
      if (index + 1 >= words.length) {
        navigate(SCREENS.RESULTS, { results });
      } else {
        setIndex((i) => i + 1);
      }
    }, 280);
  };

  const pct = ((index) / words.length) * 100;

  if (!current) return null;

  return (
    <div className="session-screen">
      {/* Header */}
      <div className="session-header">
        <button className="back-btn" onClick={() => setShowExit(true)}>✕</button>
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Card {index + 1} of {words.length}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flashcard-wrap">
        <div className={`flashcard ${cardState !== 'idle' ? cardState : ''}`}>
          <div className="card-meta">
            <span
              className="mod-badge"
              style={{ background: modColor(current.module) }}
            >
              {current.module}
            </span>
            <span className={`badge badge-${current.difficulty}`}>
              {current.difficulty}
            </span>
            <span className="badge" style={{ background: '#F3F4F6', color: '#6B7280' }}>
              {isDeToUk ? '🇩🇪 → 🇺🇦' : '🇺🇦 → 🇩🇪'}
            </span>
          </div>

          <div className="card-word">{prompt}</div>
          <div className="card-hint">Type the translation below</div>

          {wrongReveal && (
            <div className="wrong-answer-reveal">
              <div className="label">Correct answer</div>
              <div className="correct-answer">{answer}</div>
            </div>
          )}

          {cardState === 'correct' && (
            <div className="check-overlay">
              <span className="check-icon">✅</span>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="session-input-area">
        <input
          ref={inputRef}
          className="input answer-input"
          placeholder="Type your answer…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (wrongReveal ? next() : submit())}
          disabled={cardState === 'correct' || cardState === 'exiting'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <div className="session-actions">
          {!wrongReveal ? (
            <button
              className="btn btn-primary btn-full"
              onClick={submit}
              disabled={!input.trim() || cardState === 'correct' || cardState === 'exiting'}
            >
              Submit
            </button>
          ) : (
            <button className="btn btn-secondary btn-full" onClick={next}>
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Exit dialog */}
      {showExit && (
        <div className="dialog-overlay" onClick={() => setShowExit(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Exit Session?</h3>
            <p>Your progress for this session won't be saved. Are you sure you want to quit?</p>
            <div className="dialog-btns">
              <button className="btn btn-secondary" onClick={() => setShowExit(false)}>
                Keep Going
              </button>
              <button className="btn btn-danger" onClick={() => navigate(SCREENS.HOME)}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
