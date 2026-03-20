import { useState } from 'react';
import Home from './screens/Home';
import SessionConfig from './screens/SessionConfig';
import LearningSession from './screens/LearningSession';
import Results from './screens/Results';
import WordManager from './screens/WordManager';

export const SCREENS = {
  HOME: 'home',
  CONFIG: 'config',
  SESSION: 'session',
  RESULTS: 'results',
  MANAGE: 'manage',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [fading, setFading] = useState(false);
  const [sessionConfig, setSessionConfig] = useState(null);
  const [sessionWords, setSessionWords] = useState([]);
  const [sessionResults, setSessionResults] = useState(null);

  const navigate = (newScreen, data = {}) => {
    setFading(true);
    setTimeout(() => {
      setScreen(newScreen);
      if (data.config !== undefined) setSessionConfig(data.config);
      if (data.words !== undefined) setSessionWords(data.words);
      if (data.results !== undefined) setSessionResults(data.results);
      setFading(false);
    }, 220);
  };

  const props = { navigate, SCREENS };

  return (
    <div className={`app-root ${fading ? 'fade-out' : 'fade-in'}`}>
      {screen === SCREENS.HOME && <Home {...props} />}
      {screen === SCREENS.CONFIG && <SessionConfig {...props} initialConfig={sessionConfig} />}
      {screen === SCREENS.SESSION && (
        <LearningSession {...props} words={sessionWords} config={sessionConfig} />
      )}
      {screen === SCREENS.RESULTS && (
        <Results {...props} results={sessionResults} config={sessionConfig} />
      )}
      {screen === SCREENS.MANAGE && <WordManager {...props} />}
    </div>
  );
}
