import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

const getAccounts = () => {
  const saved = localStorage.getItem('levelup-accounts');
  return saved ? JSON.parse(saved) : [];
};

const saveAccounts = (accounts) => {
  localStorage.setItem('levelup-accounts', JSON.stringify(accounts));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('levelup-auth');
    return saved ? JSON.parse(saved) : null;
  });

  const register = (email, username) => {
    if (!email.trim() || !username.trim()) return 'All fields are required.';
    const accounts = getAccounts();
    if (accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) {
      return 'Username already taken. Please choose another.';
    }
    if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      return 'An account with this email already exists.';
    }
    const newAccount = { email: email.trim(), username: username.trim(), avatar: null };
    saveAccounts([...accounts, newAccount]);
    const userData = { username: newAccount.username, email: newAccount.email, avatar: null };
    setUser(userData);
    localStorage.setItem('levelup-auth', JSON.stringify(userData));
    return null;
  };

  const login = (username) => {
    if (!username.trim()) return 'Please enter your username.';
    const accounts = getAccounts();
    const account = accounts.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (!account) return 'No account found with that username. Please sign up first.';
    const userData = { username: account.username, email: account.email, avatar: account.avatar || null };
    setUser(userData);
    localStorage.setItem('levelup-auth', JSON.stringify(userData));
    return null;
  };

  const updateProfile = ({ username, avatar }) => {
    const accounts = getAccounts();
    const updated = accounts.map(a =>
      a.username.toLowerCase() === user.username.toLowerCase()
        ? { ...a, username: username || a.username, avatar: avatar !== undefined ? avatar : a.avatar }
        : a
    );
    saveAccounts(updated);
    const newUser = {
      ...user,
      username: username || user.username,
      avatar: avatar !== undefined ? avatar : user.avatar,
    };
    setUser(newUser);
    localStorage.setItem('levelup-auth', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('levelup-auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
