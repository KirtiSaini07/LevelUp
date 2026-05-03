import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Gamepad2, Mail, User, LogIn, UserPlus } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login, register } = useContext(AuthContext);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const err = login(username);
    if (err) setError(err);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    const err = register(email, username);
    if (err) setError(err);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setUsername('');
    setEmail('');
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-slide-up">

        <div className="login-header">
          <div className="login-logo">
            <Gamepad2 size={40} color="var(--accent-primary)" />
          </div>
          <h1>LevelUp</h1>
          <p>Your Gamified Productivity Hub</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            <LogIn size={16} />
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            <UserPlus size={16} />
            Create Account
          </button>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username..."
                  required
                  className="input-field"
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-primary login-btn">
              Enter the Realm
            </button>
            <p className="auth-switch-hint">
              No account? <button type="button" className="link-btn" onClick={() => switchMode('register')}>Create one</button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@example.com"
                  required
                  className="input-field"
                  autoFocus
                />
              </div>
            </div>
            <div className="form-group">
              <label>Choose a Username</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your hero name..."
                  required
                  className="input-field"
                />
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-primary login-btn">
              Begin Your Journey
            </button>
            <p className="auth-switch-hint">
              Already have an account? <button type="button" className="link-btn" onClick={() => switchMode('login')}>Sign in</button>
            </p>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;
