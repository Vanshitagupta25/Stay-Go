import React, { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { App } from './App';
import { WelcomePage } from './pages/WelcomePage';

const WELCOME_ENTERED_KEY = 'staygo:welcome-entered';

export const Root: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(() => {
    try {
      return sessionStorage.getItem(WELCOME_ENTERED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [isLeaving, setIsLeaving] = useState(false);

  const handleExplore = () => {
    if (isLeaving) return;

    try {
      sessionStorage.setItem(WELCOME_ENTERED_KEY, '1');
    } catch {}
    setIsLeaving(true);
    window.setTimeout(() => setHasEntered(true), 450);
  };

  return (
    <MotionConfig reducedMotion="user">
      {hasEntered ? (
        <div className="app-reveal">
          <App />
        </div>
      ) : (
        <WelcomePage onExplore={handleExplore} isLeaving={isLeaving} />
      )}
    </MotionConfig>
  );
};
