import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Zap } from 'lucide-react';
import './LevelUpOverlay.css';

const LevelUpOverlay = () => {
  const { levelUpEvent, level } = useContext(UserContext);

  if (!levelUpEvent) return null;

  return (
    <div className="levelup-overlay">
      <div className="levelup-content animate-pop">
        <Zap className="levelup-icon" size={80} />
        <h1 className="levelup-title">LEVEL UP!</h1>
        <p className="levelup-subtitle">You are now Level {level}</p>
      </div>
      {/* CSS Confetti / Particles can be added via CSS animations */}
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      <div className="particle particle-3"></div>
      <div className="particle particle-4"></div>
      <div className="particle particle-5"></div>
    </div>
  );
};

export default LevelUpOverlay;
