import React, { createContext, useState, useCallback, useMemo, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`levelup-tasks-${user.username}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync tasks with localStorage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`levelup-tasks-${user.username}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  // Load user-specific tasks when user changes
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`levelup-tasks-${user.username}`);
      setTasks(saved ? JSON.parse(saved) : []);
    } else {
      setTasks([]);
    }
  }, [user]);

  const addTask = useCallback((task) => {
    setTasks(prev => [{
      ...task,
      category: task.category || 'Logic', // default category
      id: Date.now(),
      status: 'active',
      createdAt: new Date().toISOString()
    }, ...prev]);
  }, []);

  const updateTask = useCallback((id, updatedFields) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  }, []);

  const completeTask = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Memoizing derived state for performance
  const activeTasks = useMemo(() => tasks.filter(t => t.status === 'active'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed'), [tasks]);

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      activeTasks, 
      completedTasks, 
      addTask, 
      updateTask, 
      completeTask, 
      deleteTask 
    }}>
      {children}
    </TaskContext.Provider>
  );
};
