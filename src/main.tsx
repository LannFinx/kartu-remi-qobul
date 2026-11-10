import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { App } from './App';
import { MainMenuScreen } from './components/MainMenuScreen';
import { CardLab } from './lab/CardLab';
import './index.css';

type ScreenMode = 'menu' | 'table' | 'tutorial';

const RootView: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const initialMode: ScreenMode = params.has('room') || params.has('table')
    ? 'table'
    : params.has('tutorial')
      ? 'tutorial'
      : 'menu';

  const [screenMode, setScreenMode] = useState<ScreenMode>(initialMode);
  const [autoLobby, setAutoLobby] = useState(() => params.has('room'));

  return (
    <MotionConfig reducedMotion="user">
      {screenMode === 'menu' && (
        <MainMenuScreen
          onStartVsBot={() => {
            setAutoLobby(false);
            setScreenMode('table');
          }}
          onStartOnlineLobby={() => {
            setAutoLobby(true);
            setScreenMode('table');
          }}
          onStartTutorial={() => {
            setScreenMode('tutorial');
          }}
        />
      )}

      {screenMode === 'tutorial' && (
        <CardLab
          onBackToMenu={() => setScreenMode('menu')}
          onOpenFullTable={() => {
            setAutoLobby(false);
            setScreenMode('table');
          }}
          onOpenOnlineLobby={() => {
            setAutoLobby(true);
            setScreenMode('table');
          }}
        />
      )}

      {screenMode === 'table' && (
        <App
          autoOpenLobby={autoLobby}
          onBackToMenu={() => setScreenMode('menu')}
          onOpenTutorial={() => setScreenMode('tutorial')}
        />
      )}
    </MotionConfig>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootView />
  </React.StrictMode>
);
