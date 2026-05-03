import React, { useState, useContext, useMemo, useCallback } from 'react';
import { TaskContext } from '../context/TaskContext';
import { UserContext } from '../context/UserContext';
import { CheckCircle2, Trash2, Plus, ArrowUp, ArrowDown, Shield, Brain, Zap, Heart } from 'lucide-react';
import { computeBadges, BADGE_TIERS } from '../utils/badges';
import './Quests.css';

const CategoryIcon = ({ category, size = 16 }) => {
  switch (category) {
    case 'Logic': return <Brain size={size} color="var(--accent-primary)" />;
    case 'Creativity': return <Zap size={size} color="var(--warning)" />;
    case 'Stamina': return <Shield size={size} color="var(--success)" />;
    case 'Health': return <Heart size={size} color="var(--danger)" />;
    default: return <Brain size={size} color="var(--accent-primary)" />;
  }
};

const TaskItem = React.memo(({ task, onComplete, onDelete }) => {
  return (
    <div className="quest-card">
      <div className="quest-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CategoryIcon category={task.category} />
          <span className="quest-title">{task.title}</span>
        </div>
        <span className="quest-desc">{task.description}</span>
      </div>
      <div className="quest-actions">
        <span className="xp-reward">+{task.xpReward} XP</span>
        {task.status === 'active' && (
          <button className="btn-icon" onClick={() => onComplete(task.id, task.xpReward)} title="Complete Quest">
            <CheckCircle2 color="var(--success)" />
          </button>
        )}
        <button className="btn-icon" onClick={() => onDelete(task.id)} title="Delete Quest">
          <Trash2 color="var(--danger)" />
        </button>
      </div>
    </div>
  );
});

const Quests = () => {
  const { tasks, addTask, completeTask, deleteTask } = useContext(TaskContext);
  const { addXp } = useContext(UserContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Logic');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('active');
  const [sortOrder, setSortOrder] = useState('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleAddQuest = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title, description, category, xpReward: 50 });
    setTitle('');
    setDescription('');
    setCategory('Logic');
  };

  const handleComplete = useCallback((id, xpReward) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    completeTask(id);

    // Calculate if this completion unlocked a new badge tier
    const completedInCategory = tasks.filter(t => t.status === 'completed' && t.category === task.category).length;
    const newCount = completedInCategory + 1;
    
    let bonusXp = 0;
    const unlockedTier = BADGE_TIERS[task.category]?.find(t => t.threshold === newCount);
    if (unlockedTier) {
      bonusXp = unlockedTier.xpBonus;
      // Optional: Add a toast notification here if you implement one!
    }
    
    addXp(xpReward + bonusXp);
  }, [tasks, completeTask, addXp]);

  const handleDelete = useCallback((id) => {
    deleteTask(id);
  }, [deleteTask]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks.filter(t => t.status === filter);
    
    if (searchQuery) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [tasks, filter, searchQuery, sortOrder]);

  const paginatedTasks = useMemo(() => {
    if (filter === 'active') return filteredAndSortedTasks;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTasks, filter, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedTasks.length / itemsPerPage);

  // Calculate Badges
  const badges = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed');
    return computeBadges(completed);
  }, [tasks]);

  return (
    <div className="quests-container">
      <div className="quests-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Quests</h1>
        <div className="badges-container" style={{ display: 'flex', gap: '8px' }}>
          {badges.map((b, i) => (
            <div key={i} className="badge glass-panel" style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: b.color, borderColor: b.color }} title={`${b.name} (${b.count} quests)`}>
              {b.category === 'Logic' && <Brain size={16} />}
              {b.category === 'Creativity' && <Zap size={16} />}
              {b.category === 'Stamina' && <Shield size={16} />}
              {b.category === 'Health' && <Heart size={16} />}
              {b.name}
            </div>
          ))}
        </div>
      </div>

      <form className="add-quest-form" onSubmit={handleAddQuest} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Quest Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          style={{ flex: '1 1 200px' }}
          required
        />
        <input 
          type="text" 
          placeholder="Description (Optional)" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          style={{ flex: '2 1 300px' }}
        />
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="input-field"
          style={{ flex: '0 1 120px' }}
        >
          <option value="Logic">Logic</option>
          <option value="Creativity">Creativity</option>
          <option value="Stamina">Stamina</option>
          <option value="Health">Health</option>
        </select>
        <button type="submit" className="btn btn-primary" style={{ flex: '0 1 auto' }}>
          <Plus size={20} /> Add
        </button>
      </form>

      <div className="quest-filters">
        <select 
          className="input-field" 
          value={filter} 
          onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
          style={{ flex: 0.3 }}
        >
          <option value="active">Active Quests</option>
          <option value="completed">Completed History</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Search quests..." 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="input-field"
        />

        <button 
          className="btn" 
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          style={{ background: 'var(--bg-secondary)' }}
        >
          {sortOrder === 'desc' ? <ArrowDown size={20} /> : <ArrowUp size={20} />} Date
        </button>
      </div>

      <div className="quest-list">
        {paginatedTasks.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No quests found.
          </p>
        ) : (
          paginatedTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onComplete={handleComplete} 
              onDelete={handleDelete} 
            />
          ))
        )}
      </div>

      {filter === 'completed' && totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            className="btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Quests;

