import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { App } from './App';
import { CardLab } from './lab/CardLab';
import './index.css';

const RootView: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const [showLab, setShowLab] = useState(() => params.has('lab'));
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
          <div className="fixed bottom-3 right-3 z-40">
            <button
              type="button"
              onClick={() => setShowLab(true)}
              className="btn-tactile px-3.5 py-1.5 rounded-2xl bg-slate-900 text-amber-300 border-2 border-slate-700 border-b-[4px] border-b-slate-950 font-display font-black text-xs shadow-lg"
            >
              Latihan Solo
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
