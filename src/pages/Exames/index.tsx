import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { 
  Plus, FileText, Upload, Trash2,  Download, Calendar, Activity, X
} from 'lucide-react';

interface Marker {
  id: string;
  name: string; // Ex: Colesterol Total
  value: string; // Ex: 180
  unit: string; // Ex: mg/dL
}

interface Exam {
  id: number;
  date: string;
  title: string;
  laboratory: string;
  file_url: string | null;
  markers: Marker[];
}

export function Exames() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLoading] = useState(false);
  const [mode, setMode] = useState<'list' | 'form'>('list');

  // Dados
  const [exams, setExams] = useState<Exam[]>([]);

  // Form States
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [lab, setLab] = useState('');
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. CARREGAR EXAMES
  useEffect(() => {
    fetchExams();
  }, [user]);

  async function fetchExams() {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  // 2. FORMULÁRIO
  const handleNewExam = () => {
    setTitle('');
    setLab('');
    setDate(new Date().toISOString().split('T')[0]);
    setMarkers([]);
    setFile(null);
    setMode('form');
  };

  // Manipulação de Marcadores (Resultados)
  const addMarker = () => {
    setMarkers([...markers, { id: crypto.randomUUID(), name: '', value: '', unit: '' }]);
  };

  const removeMarker = (index: number) => {
    const list = [...markers];
    list.splice(index, 1);
    setMarkers(list);
  };

  const updateMarker = (index: number, field: keyof Marker, value: string) => {
    const list = [...markers];
    list[index] = { ...list[index], [field]: value };
    setMarkers(list);
  };

  // 3. SALVAR
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !user) return;

    try {
      setIsSubmitting(true);
      let fileUrl = null;

      // Upload do Arquivo (PDF ou Imagem)
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('exam-files').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('exam-files').getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      const payload = {
        user_id: user.id,
        date,
        title,
        laboratory: lab,
        file_url: fileUrl,
        markers
      };

      const { error } = await supabase.from('exams').insert([payload]);
      if (error) throw error;

      await fetchExams();
      setMode('list');
    } catch (error) {
      alert('Erro ao salvar exame.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. DELETAR
  const handleDelete = async (id: number) => {
    if (!confirm('Excluir registro de exame?')) return;
    await supabase.from('exams').delete().eq('id', id);
    setExams(exams.filter(e => e.id !== id));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Exames Laboratoriais</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Centralize resultados e arquivos.</p>
        </div>
        {mode === 'list' && (
          <Button onClick={handleNewExam}><Plus size={18} /> Novo Resultado</Button>
        )}
      </header>

      {/* --- LISTA --- */}
      {mode === 'list' && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {exams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
              Nenhum exame cadastrado.
            </div>
          ) : (
            exams.map(exam => (
              <Card key={exam.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ padding: '0.8rem', backgroundColor: '#e0f2fe', borderRadius: '12px', color: '#0284c7', height: 'fit-content' }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{exam.title}</h3>
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(exam.date).toLocaleDateString('pt-BR')}</span>
                        {exam.laboratory && <span>| {exam.laboratory}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {exam.file_url && (
                      <a href={exam.file_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" ><Download size={14} /> Arquivo</Button>
                      </a>
                    )}
                    <button onClick={() => handleDelete(exam.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1', padding: '0.4rem' }}>
                      <Trash2 size={18} className="hover:text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Marcadores em Destaque */}
                {exam.markers && exam.markers.length > 0 && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                    {exam.markers.map((marker, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{marker.name}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {marker.value} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>{marker.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* --- FORMULÁRIO --- */}
      {mode === 'form' && (
        <form onSubmit={handleSave}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Registrar Exame</h3>
              <Button type="button" variant="secondary" onClick={() => setMode('list')}>Cancelar</Button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <Input label="Título / Descrição" placeholder="Ex: Hemograma Completo" value={title} onChange={e => setTitle(e.target.value)} required />
                <Input type="date" label="Data do Exame" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              
              <Input label="Laboratório (Opcional)" placeholder="Ex: Lavoisier" value={lab} onChange={e => setLab(e.target.value)} />

              {/* Upload */}
              <div style={{ border: '1px dashed var(--border-color)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
                  accept="image/*,application/pdf"
                  style={{ display: 'none' }} 
                />
                <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  {file ? (
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{file.name}</span>
                  ) : (
                    "Arraste um PDF/Imagem ou clique para selecionar"
                  )}
                </div>
                <Button type="button" variant="secondary"  onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} /> Selecionar Arquivo
                </Button>
              </div>
            </div>

            {/* Marcadores Dinâmicos */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} /> Resultados Principais (Opcional)
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {markers.map((marker, index) => (
                  <div key={marker.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.8rem', alignItems: 'center' }}>
                    <Input placeholder="Nome (Ex: Colesterol HDL)" value={marker.name} onChange={e => updateMarker(index, 'name', e.target.value)} />
                    <Input placeholder="Valor (Ex: 55)" value={marker.value} onChange={e => updateMarker(index, 'value', e.target.value)} />
                    <Input placeholder="Unid (mg/dL)" value={marker.unit} onChange={e => updateMarker(index, 'unit', e.target.value)} />
                    <button type="button" onClick={() => removeMarker(index)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={addMarker} style={{ alignSelf: 'start', marginTop: '0.5rem' }}>
                  <Plus size={14} /> Adicionar Linha
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <Button type="submit" disabled={isSubmitting} style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
                 {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}