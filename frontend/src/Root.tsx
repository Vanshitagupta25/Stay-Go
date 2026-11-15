import React, { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { App } from './App';
import { WelcomePage } from './pages/WelcomePage';

export const Root: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleExplore = () => {
    if (isLeaving) return;

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
