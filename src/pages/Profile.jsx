import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { TaskContext } from '../context/TaskContext';
import { computeBadges, getBadgeRoadmap, ALL_CATEGORIES, BADGE_TIERS } from '../utils/badges';
import { Brain, Zap, Shield, Heart, Check, Lock } from 'lucide-react';
import './Profile.css';

const AVATARS = [
  { id: 'fox',     emoji: '🦊', label: 'Fox',     bg: '#f97316' },
  { id: 'cat',     emoji: '🐱', label: 'Cat',     bg: '#a855f7' },
  { id: 'dog',     emoji: '🐶', label: 'Dog',     bg: '#eab308' },
  { id: 'panda',   emoji: '🐼', label: 'Panda',   bg: '#374151' },
  { id: 'koala',   emoji: '🐨', label: 'Koala',   bg: '#6b7280' },
  { id: 'lion',    emoji: '🦁', label: 'Lion',    bg: '#f59e0b' },
  { id: 'tiger',   emoji: '🐯', label: 'Tiger',   bg: '#ea580c' },
  { id: 'bear',    emoji: '🐻', label: 'Bear',    bg: '#78716c' },
  { id: 'bunny',   emoji: '🐰', label: 'Bunny',   bg: '#ec4899' },
  { id: 'hamster', emoji: '🐹', label: 'Hamster', bg: '#d97706' },
  { id: 'frog',    emoji: '🐸', label: 'Frog',    bg: '#10b981' },
  { id: 'owl',     emoji: '🦉', label: 'Owl',     bg: '#8b5cf6' },
];

const CategoryIcon = ({ category, size = 18 }) => {
  switch (category) {
    case 'Logic':      return <Brain size={size} />;
    case 'Creativity': return <Zap size={size} />;
    case 'Stamina':    return <Shield size={size} />;
    case 'Health':     return <Heart size={size} />;
    default:           return <Brain size={size} />;
  }
};

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { level, xp, xpNeededForNextLevel } = useContext(UserContext);
  const { tasks } = useContext(TaskContext);

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || null);
  const [saved, setSaved] = useState(false);

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const badges = computeBadges(completedTasks);

  const xpPercent = Math.min((xp / xpNeededForNextLevel) * 100, 100);

  // Category counts for roadmap
  const catCounts = { Logic: 0, Creativity: 0, Stamina: 0, Health: 0 };
  completedTasks.forEach(t => {
    if (catCounts[t.category] !== undefined) catCounts[t.category]++;
  });

  const currentAvatar = AVATARS.find(a => a.id === selectedAvatar);

  const handleSave = () => {
    updateProfile({ avatar: selectedAvatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="profile-page animate-slide-up">

      {/* Hero Section */}
      <div className="profile-hero glass-panel">
        <div className="avatar-display" style={{ background: currentAvatar?.bg || 'var(--accent-primary)' }}>
          <span className="avatar-emoji">{currentAvatar?.emoji || user?.username?.[0]?.toUpperCase() || '?'}</span>
        </div>
        <div className="profile-hero-info">
          <h1>{user?.username}</h1>
          <p className="profile-email">{user?.email}</p>
          <div className="profile-level-badge">Level {level} Hero</div>
          <div className="xp-bar-container">
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
            </div>
            <span className="xp-label">{xp} / {xpNeededForNextLevel} XP to Level {level + 1}</span>
          </div>
        </div>
      </div>

      <div className="profile-grid">

        {/* Avatar Picker */}
        <div className="profile-card glass-panel">
          <h2>Choose Your Avatar</h2>
          <p>Pick the hero class that represents you.</p>
          <div className="avatar-grid">
            {AVATARS.map(av => (
              <button
                key={av.id}
                className={`avatar-option ${selectedAvatar === av.id ? 'selected' : ''}`}
                style={{ '--av-color': av.bg }}
                onClick={() => setSelectedAvatar(av.id)}
                title={av.label}
              >
                <div className="av-circle" style={{ background: av.bg }}>
                  <span>{av.emoji}</span>
                </div>
                <span className="av-label">{av.label}</span>
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: '16px', width: '100%' }}
            onClick={handleSave}
          >
            {saved ? '✓ Saved!' : 'Save Avatar'}
          </button>
        </div>

        {/* Badge Showcase */}
        <div className="profile-card glass-panel">
          <h2>Badge Collection</h2>
          <p>Complete quests to unlock and upgrade your badges.</p>

          <div className="badge-roadmap">
            {ALL_CATEGORIES.map(category => {
              const count = catCounts[category];
              const tiers = BADGE_TIERS[category];
              const nextUnlocked = tiers.find(t => count < t.threshold);
              const progressToNext = nextUnlocked
                ? Math.min((count / nextUnlocked.threshold) * 100, 100)
                : 100;

              return (
                <div key={category} className="badge-category-row">
                  <div className="badge-cat-header">
                    <CategoryIcon category={category} size={16} />
                    <span className="badge-cat-name">{category}</span>
                    <span className="badge-cat-count">{count} completed</span>
                  </div>

                  <div className="badge-tiers-row">
                    {tiers.map((tier, i) => {
                      const earned = count >= tier.threshold;
                      return (
                        <div
                          key={i}
                          className={`badge-tier-chip ${earned ? 'earned' : 'locked'}`}
                          style={earned ? { background: tier.color + '22', borderColor: tier.color, color: tier.color } : {}}
                          title={earned
                            ? `${tier.name} — +${tier.xpBonus} XP bonus earned`
                            : `${tier.name} — Reach ${tier.threshold} ${category} quests (${count}/${tier.threshold})`
                          }
                        >
                          {earned ? <Check size={12} /> : <Lock size={12} />}
                          <span>{tier.name}</span>
                        </div>
                      );
                    })}
                  </div>

                  {nextUnlocked && (
                    <div className="badge-progress-bar">
                      <div
                        className="badge-progress-fill"
                        style={{ width: `${progressToNext}%`, background: tiers[0].color }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
