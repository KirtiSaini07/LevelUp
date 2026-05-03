import React, { useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import './Header.css';

const Header = () => {
  const { level, xp, xpNeededForNextLevel, theme, toggleTheme } = useContext(UserContext);
  
  const xpPercentage = Math.min((xp / xpNeededForNextLevel) * 100, 100);

  return (
    <header className="header glass-panel">
      <div className="header-content">
        <div className="level-badge" title={`Level ${level}`}>
          {level}
        </div>
        
        <div className="xp-container">
          <div className="xp-text">
            <span>XP Progress</span>
            <span>{xp} / {xpNeededForNextLevel}</span>
          </div>
          <div className="xp-bar-bg">
            <div 
              className="xp-bar-fill" 
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
        </div>

        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
