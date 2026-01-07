import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2, X } from 'lucide-react';
import styles from './DashboardCalendar.module.css';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
}

export function DashboardCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');

  useEffect(() => { fetchEvents(); }, [currentDate, user]);

  async function fetchEvents() {
    if (!user) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startStr = new Date(year, month, 1).toISOString().split('T')[0];
    const endStr = new Date(year, month + 1, 0).toISOString().split('T')[0];
    const { data } = await supabase.from('calendar_events').select('*').gte('date', startStr).lte('date', endStr);
    setEvents(data || []);
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    const dateStr = new Date(year, month, day).toLocaleDateString('en-CA');
    setSelectedDate(dateStr);
    setNewEventTitle('');
    setNewEventTime('');
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !selectedDate || !user) return;
    const payload = { user_id: user.id, title: newEventTitle, time: newEventTime || null, date: selectedDate };
    const { data, error } = await supabase.from('calendar_events').insert([payload]).select().single();
    if (!error && data) {
      setEvents([...events, data]);
      setNewEventTitle('');
      setNewEventTime('');
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm('Excluir evento?')) return;
    await supabase.from('calendar_events').delete().eq('id', id);
    setEvents(events.filter(e => e.id !== id));
  };

  const selectedDayEvents = events.filter(e => e.date === selectedDate);

  return (
    <div className={styles.wrapper}>
      {/* CALENDÁRIO */}
      <Card className={styles.calendarCard}>
        <div className={styles.header}>
          <span className={styles.monthTitle}>{monthName}</span>
          <div className={styles.navGroup}>
            <button onClick={() => changeMonth(-1)} className={styles.navBtn}><ChevronLeft size={16} /></button>
            <button onClick={() => changeMonth(1)} className={styles.navBtn}><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className={styles.weekHeader}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className={styles.weekDay}>{d}</div>
          ))}
        </div>

        <div className={styles.daysGrid}>
          {blanksArray.map(b => <div key={`blank-${b}`} className={styles.dayCell} style={{ backgroundColor: '#fcfcfc' }} />)}
          {daysArray.map(day => {
            const dateStr = new Date(year, month, day).toLocaleDateString('en-CA');
            const dayEvents = events.filter(e => e.date === dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div key={day} onClick={() => handleDayClick(day)}
                className={`${styles.dayCell} ${isSelected ? styles.selected : ''}`}
              >
                <div className={`${styles.dayNumber} ${isToday ? styles.today : ''}`}>{day}</div>
                <div className={styles.eventList}>
                  {dayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} className={styles.eventBadge}>{ev.title}</div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>+</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* PAINEL LATERAL */}
      {selectedDate && (
        <Card className={styles.sidePanel}>
          <div className={styles.panelHeader}>
             <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
               {new Date(selectedDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' })}
             </h3>
             <button onClick={() => setSelectedDate(null)} className={styles.closeBtn}><X size={16} /></button>
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {selectedDayEvents.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nada agendado.</div>
            ) : (
              selectedDayEvents.map(ev => (
                <div key={ev.id} className={styles.eventItem}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ev.title}</div>
                    {ev.time && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {ev.time}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteEvent(ev.id)} className={styles.deleteBtn}><Trash2 size={14} /></button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={addEvent} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <Input placeholder="Novo compromisso..." value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <Input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} />
                 <Button type="submit"><Plus size={16} /></Button>
              </div>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}