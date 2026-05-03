import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sword, StickyNote, Calendar, Gamepad2, LogOut, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

const AVATAR_MAP = {
  fox: '🦊', cat: '🐱', dog: '🐶', panda: '🐼',
  koala: '🐨', lion: '🦁', tiger: '🐯', bear: '🐻',
  bunny: '🐰', hamster: '🐹', frog: '🐸', owl: '🦉',
};

const AVATAR_COLORS = {
  fox: '#f97316', cat: '#a855f7', dog: '#eab308', panda: '#374151',
  koala: '#6b7280', lion: '#f59e0b', tiger: '#ea580c', bear: '#78716c',
  bunny: '#ec4899', hamster: '#d97706', frog: '#10b981', owl: '#8b5cf6',
};

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const avatarEmoji = user?.avatar ? AVATAR_MAP[user.avatar] : user?.username?.[0]?.toUpperCase();
  const avatarColor = user?.avatar ? AVATAR_COLORS[user.avatar] : 'var(--accent-primary)';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Gamepad2 className="logo-icon" size={32} />
        <span>LevelUp</span>
      </div>

      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
          <LayoutDashboard className="nav-icon" size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/quests" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Sword className="nav-icon" size={20} />
          Quests
        </NavLink>
        <NavLink to="/notes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <StickyNote className="nav-icon" size={20} />
          Notes
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Calendar className="nav-icon" size={20} />
          Calendar
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <User className="nav-icon" size={20} />
          Profile
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/profile" className="sidebar-user-card">
          <div className="sidebar-avatar" style={{ background: avatarColor }}>
            {avatarEmoji}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-username">{user?.username}</span>
            <span className="sidebar-email">{user?.email}</span>
          </div>
        </NavLink>
        <button className="btn logout-btn" onClick={logout}>
          <LogOut size={18} />
          Abandon Quest
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
