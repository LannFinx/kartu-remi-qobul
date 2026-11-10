import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { App } from './App';
import { CardLab } from './lab/CardLab';
import './index.css';

const RootView: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const hasTableOrRoom = params.has('table') || params.has('room');
  const [showLab, setShowLab] = useState(() => !hasTableOrRoom);
  const [autoLobby, setAutoLobby] = useState(() => params.has('room'));

  return (
    <MotionConfig reducedMotion="user">
      {showLab ? (
        <CardLab
          onOpenFullTable={() => {
            setAutoLobby(false);
            setShowLab(false);
          }}
          onOpenOnlineLobby={() => {
            setAutoLobby(true);
            setShowLab(false);
          }}
        />
      ) : (
        <div className="relative">
          <div className="fixed bottom-4 right-4 z-40">
            <button
              type="button"
              onClick={() => setShowLab(true)}
              className="btn-tactile px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-display font-extrabold text-xs shadow-lg hover:bg-amber-300"
            >
              Mode 1 Pemain (Lab)
            </button>
          </div>
          <App autoOpenLobby={autoLobby} />
        </div>
      )}
    </MotionConfig>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootView />
  </React.StrictMode>
);
