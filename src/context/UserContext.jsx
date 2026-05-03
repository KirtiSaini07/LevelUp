import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // Load initial stats from localStorage based on user
  const [level, setLevel] = useState(() => {
    if (!user) return 1;
    const saved = localStorage.getItem(`levelup-level-${user.username}`);
    return saved ? JSON.parse(saved) : 1;
  });
  
  const [xp, setXp] = useState(() => {
    if (!user) return 0;
    const saved = localStorage.getItem(`levelup-xp-${user.username}`);
    return saved ? JSON.parse(saved) : 0;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('levelup-theme');
    return saved ? saved : 'dark';
  });

  const [levelUpEvent, setLevelUpEvent] = useState(false);

  const xpNeededForNextLevel = level * 100;

  // Persist stats when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`levelup-level-${user.username}`, JSON.stringify(level));
      localStorage.setItem(`levelup-xp-${user.username}`, JSON.stringify(xp));
    }
  }, [level, xp, user]);

  // Handle theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('levelup-theme', theme);
  }, [theme]);

  // Update stats when user changes (e.g. login/logout)
  useEffect(() => {
    if (user) {
      const savedLevel = localStorage.getItem(`levelup-level-${user.username}`);
      const savedXp = localStorage.getItem(`levelup-xp-${user.username}`);
      setLevel(savedLevel ? JSON.parse(savedLevel) : 1);
      setXp(savedXp ? JSON.parse(savedXp) : 0);
    } else {
      setLevel(1);
      setXp(0);
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addXp = (amount) => {
    setXp(prevXp => {
      let newXp = prevXp + amount;
      let newLevel = level;
      let xpThreshold = newLevel * 100;

      while (newXp >= xpThreshold) {
        newLevel += 1;
        newXp -= xpThreshold;
        xpThreshold = newLevel * 100;
      }

      if (newLevel !== level) {
        setLevel(newLevel);
        setLevelUpEvent(true);
        setTimeout(() => setLevelUpEvent(false), 4000); // 4s animation
      }

      return newXp;
    });
  };

  return (
    <UserContext.Provider value={{ level, xp, xpNeededForNextLevel, theme, toggleTheme, addXp, levelUpEvent }}>
      {children}
    </UserContext.Provider>
  );
};
