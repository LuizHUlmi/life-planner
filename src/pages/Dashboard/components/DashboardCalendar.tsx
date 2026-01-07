import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2, X } from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
}

export function DashboardCalendar() {
  const { user } = useAuth();
  
  // Data atual de navegação do calendário (Mês/Ano)
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Data selecionada (clicada) para ver/adicionar eventos
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');

  // Carrega eventos quando muda o mês
  useEffect(() => {
    fetchEvents();
  }, [currentDate, user]);

  async function fetchEvents() {
    if (!user) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Intervalo do mês
    const startStr = new Date(year, month, 1).toISOString().split('T')[0];
    const endStr = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('date', startStr)
      .lte('date', endStr);
      
    setEvents(data || []);
  }

  // --- LÓGICA DE CALENDÁRIO ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (Dom) a 6 (Sab)

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
    setSelectedDate(null); // Fecha o painel lateral ao mudar mês
  };

  // --- AÇÕES DE EVENTOS ---
  const handleDayClick = (day: number) => {
    // Formata YYYY-MM-DD localmente sem problemas de fuso horário simples
    const dateStr = new Date(year, month, day).toLocaleDateString('en-CA'); // en-CA dá formato ISO YYYY-MM-DD
    setSelectedDate(dateStr);
    setNewEventTitle('');
    setNewEventTime('');
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !selectedDate || !user) return;

    const payload = {
      user_id: user.id,
      title: newEventTitle,
      time: newEventTime || null,
      date: selectedDate
    };

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

  // Filtra eventos do dia selecionado
  const selectedDayEvents = events.filter(e => e.date === selectedDate);

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start', flexWrap: 'wrap' }}>
      
      {/* --- COLUNA ESQUERDA: O GRID DO CALENDÁRIO --- */}
      <Card style={{ flex: 2, minWidth: '300px', padding: '0', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{monthName}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => changeMonth(-1)} style={navBtnStyle}><ChevronLeft size={16} /></button>
            <button onClick={() => changeMonth(1)} style={navBtnStyle}><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Grid Dias da Semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f1f5f9', padding: '0.5rem 0' }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{d}</div>
          ))}
        </div>

        {/* Grid Numérico */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {/* Espaços em branco do início do mês */}
          {blanksArray.map(b => <div key={`blank-${b}`} style={{ height: '80px', backgroundColor: '#fcfcfc', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }} />)}

          {/* Dias */}
          {daysArray.map(day => {
            // Formata data atual do loop
            const dateStr = new Date(year, month, day).toLocaleDateString('en-CA');
            const dayEvents = events.filter(e => e.date === dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                style={{ 
                  height: '80px', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', 
                  padding: '4px', cursor: 'pointer', position: 'relative',
                  backgroundColor: isSelected ? '#f0f9ff' : 'white',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ 
                  fontSize: '0.8rem', fontWeight: isToday ? 700 : 400,
                  color: isToday ? 'var(--primary)' : 'var(--text-secondary)',
                  marginBottom: '2px'
                }}>
                  {day}
                </div>
                
                {/* Bolinhas dos Eventos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} style={{ fontSize: '0.65rem', backgroundColor: '#e0e7ff', color: 'var(--primary)', padding: '1px 4px', borderRadius: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', paddingLeft: '2px' }}>+ {dayEvents.length - 3} mais</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* --- COLUNA DIREITA: DETALHES DO DIA (PAINEL LATERAL) --- */}
      {selectedDate && (
        <Card style={{ flex: 1, minWidth: '250px', padding: '1.5rem', borderLeft: '4px solid var(--primary)', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
               {new Date(selectedDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' })}
             </h3>
             <button onClick={() => setSelectedDate(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
               <X size={16} color="var(--text-secondary)" />
             </button>
          </div>

          {/* Lista de Eventos do Dia */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {selectedDayEvents.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nada agendado.</div>
            ) : (
              selectedDayEvents.map(ev => (
                <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.6rem', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ev.title}</div>
                    {ev.time && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {ev.time}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteEvent(ev.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1' }} className="hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Adicionar Novo */}
          <form onSubmit={addEvent} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <Input 
                placeholder="Novo compromisso..." 
                value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} 
                autoFocus
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <Input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} />
                 <Button type="submit" ><Plus size={16} /></Button>
              </div>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  border: '1px solid var(--border-color)', backgroundColor: 'white', 
  borderRadius: '6px', width: '28px', height: '28px', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};