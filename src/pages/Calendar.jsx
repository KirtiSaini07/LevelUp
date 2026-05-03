import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import './Calendar.css';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Calendar = () => {
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('levelup-calendar-events');
    return saved ? JSON.parse(saved) : {};
  });

  // Modal state
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState('purple');

  useEffect(() => {
    localStorage.setItem('levelup-calendar-events', JSON.stringify(events));
  }, [events]);

  // Navigation
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build the days grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  // Trailing days from prev month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, currentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true });
  }
  // Leading days from next month
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false });
  }

  const getDateKey = (day) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  const isToday = (day, currentMonth) => {
    return currentMonth &&
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear();
  };

  const openModal = (day, currentMonth) => {
    if (!currentMonth) return;
    setSelectedDate(getDateKey(day));
    setNewEventTitle('');
    setNewEventColor('purple');
  };

  const closeModal = () => setSelectedDate(null);

  const addEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    setEvents(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), {
        id: Date.now(),
        title: newEventTitle.trim(),
        color: newEventColor,
      }]
    }));
    setNewEventTitle('');
  };

  const deleteEvent = (dateKey, eventId) => {
    setEvents(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(e => e.id !== eventId)
    }));
  };

  const COLOR_MAP = {
    purple: 'var(--accent-primary)',
    cyan: 'var(--accent-secondary)',
    green: 'var(--success)',
    yellow: 'var(--warning)',
    red: 'var(--danger)',
  };

  const selectedEvents = selectedDate ? (events[selectedDate] || []) : [];

  return (
    <div className="calendar-page animate-slide-up">

      {/* Header */}
      <div className="calendar-header">
        <h1>Calendar</h1>
        <div className="month-nav">
          <button className="btn-icon nav-arrow" onClick={prevMonth}>
            <ChevronLeft size={22} />
          </button>
          <h2 className="month-label">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
          <button className="btn-icon nav-arrow" onClick={nextMonth}>
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="cal-dow-grid">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="cal-dow-label">{d}</div>
        ))}
      </div>

      {/* Month grid */}
      <div className="cal-month-grid">
        {cells.map((cell, idx) => {
          const dateKey = cell.currentMonth ? getDateKey(cell.day) : null;
          const dayEvents = dateKey ? (events[dateKey] || []) : [];

          return (
            <div
              key={idx}
              className={`cal-cell ${!cell.currentMonth ? 'other-month' : ''} ${isToday(cell.day, cell.currentMonth) ? 'today' : ''} ${selectedDate === dateKey ? 'selected' : ''}`}
              onClick={() => openModal(cell.day, cell.currentMonth)}
            >
              <span className="cal-day-num">{cell.day}</span>
              <div className="cal-events-preview">
                {dayEvents.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    className="cal-event-dot"
                    style={{ backgroundColor: COLOR_MAP[ev.color] || COLOR_MAP.purple }}
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="cal-more">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Sidebar/Modal */}
      {selectedDate && (
        <div className="event-sidebar glass-panel animate-slide-up">
          <div className="event-sidebar-header">
            <h3>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
          </div>

          <form onSubmit={addEvent} className="add-event-form">
            <input
              type="text"
              className="input-field"
              placeholder="Event title..."
              value={newEventTitle}
              onChange={e => setNewEventTitle(e.target.value)}
              autoFocus
              required
            />
            <div className="color-picker">
              {Object.keys(COLOR_MAP).map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-dot ${newEventColor === c ? 'active' : ''}`}
                  style={{ backgroundColor: COLOR_MAP[c] }}
                  onClick={() => setNewEventColor(c)}
                  title={c}
                />
              ))}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={18} /> Add Event
            </button>
          </form>

          <div className="events-list">
            {selectedEvents.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>
                No events. Add one above!
              </p>
            ) : (
              selectedEvents.map(ev => (
                <div key={ev.id} className="event-item">
                  <div className="event-color-bar" style={{ backgroundColor: COLOR_MAP[ev.color] || COLOR_MAP.purple }} />
                  <span className="event-title">{ev.title}</span>
                  <button className="btn-icon delete-event-btn" onClick={() => deleteEvent(selectedDate, ev.id)}>
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
