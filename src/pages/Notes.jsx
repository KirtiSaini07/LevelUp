import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Search } from 'lucide-react';
import './Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('levelup-multinotes');
    if (saved) return JSON.parse(saved);
    // Migration: Check for old single note
    const oldNote = localStorage.getItem('levelup-notes');
    if (oldNote) {
      return [{
        id: Date.now().toString(),
        content: oldNote,
        updatedAt: new Date().toISOString()
      }];
    }
    return [];
  });
  
  const [activeNoteId, setActiveNoteId] = useState(notes.length > 0 ? notes[0].id : null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('levelup-multinotes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = () => {
    const newNote = {
      id: Date.now().toString(),
      content: '',
      updatedAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (content) => {
    setNotes(notes.map(n => 
      n.id === activeNoteId 
        ? { ...n, content, updatedAt: new Date().toISOString() } 
        : n
    ));
  };

  const deleteNote = (e, id) => {
    e.stopPropagation();
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    if (activeNoteId === id) {
      setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
    }
  };

  const getNoteTitle = (content) => {
    if (!content.trim()) return 'New Note';
    const firstLine = content.split('\n')[0];
    return firstLine.substring(0, 40) + (firstLine.length > 40 ? '...' : '');
  };

  const getNotePreview = (content) => {
    const lines = content.split('\n');
    if (lines.length < 2) return 'No additional text';
    return lines[1].substring(0, 50) + (lines[1].length > 50 ? '...' : '');
  };

  const filteredNotes = notes.filter(n => n.content.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="notes-app-container glass-panel">
      
      {/* Sidebar Area */}
      <div className="notes-sidebar">
        <div className="notes-sidebar-header">
          <div className="search-bar">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-icon add-note-btn" onClick={createNote} title="New Note">
            <Plus size={20} />
          </button>
        </div>
        
        <div className="notes-list">
          {filteredNotes.length === 0 ? (
            <p className="empty-notes-msg">No notes found.</p>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note.id} 
                className={`note-list-item ${note.id === activeNoteId ? 'active' : ''}`}
                onClick={() => setActiveNoteId(note.id)}
              >
                <div className="note-list-item-content">
                  <h4>{getNoteTitle(note.content)}</h4>
                  <p>{getNotePreview(note.content)}</p>
                  <span className="note-date">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button className="btn-icon delete-btn" onClick={(e) => deleteNote(e, note.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="notes-editor-area">
        {activeNote ? (
          <textarea
            className="notes-textarea"
            value={activeNote.content}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="Type your notes here..."
          />
        ) : (
          <div className="empty-editor">
            <FileText size={48} color="var(--text-secondary)" opacity={0.5} />
            <p>Select a note or create a new one to get started.</p>
            <button className="btn btn-primary" onClick={createNote}>Create Note</button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Notes;
