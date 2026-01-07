import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
// Biblioteca de compressão
import imageCompression from 'browser-image-compression'; 

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Plus, Package, MapPin, Tag, Trash2, Camera, Loader2, X
} from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  location: string;
  quantity: number;
  image_url?: string | null; // Novo campo
}

export function Inventario() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [, setLoading] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Geral');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');

  // Data
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetchInventory();
  }, [user]);

  async function fetchInventory() {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // --- LÓGICA DE IMAGEM ---
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Opções de compressão
      const options = {
        maxSizeMB: 0.5, // Máximo 500KB
        maxWidthOrHeight: 1024, // Redimensiona para no máx 1024px
        useWebWorker: true
      };

      try {
        // Comprime a imagem
        const compressedFile = await imageCompression(file, options);
        setImageFile(compressedFile);
        
        // Cria preview local
        const objectUrl = URL.createObjectURL(compressedFile);
        setPreviewUrl(objectUrl);
      } catch (error) {
        console.error("Erro na compressão:", error);
      }
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- SALVAR ---
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !user) return;

    try {
      setIsSubmitting(true);
      let publicUrl = null;

      // 1. Se tem imagem, faz upload primeiro
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`; // Caminho: user_id/timestamp.jpg

        const { error: uploadError } = await supabase.storage
          .from('inventory-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Pega a URL pública
        const { data: urlData } = supabase.storage
          .from('inventory-images')
          .getPublicUrl(fileName);
          
        publicUrl = urlData.publicUrl;
      }

      // 2. Salva no banco
      const newItem = {
        user_id: user.id,
        name,
        category,
        location,
        quantity: Number(quantity) || 1,
        image_url: publicUrl // Salva o link
      };

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      if (data) setItems([...items, data]);
      
      // Limpa campos
      setName('');
      setQuantity('1');
      clearImage();
      // Mantém categoria e local para facilitar
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- REMOVER ---
  const handleRemove = async (item: InventoryItem) => {
    if (!confirm('Remover este item do inventário?')) return;
    try {
      // 1. Remove do Banco
      const { error } = await supabase.from('inventory_items').delete().eq('id', item.id);
      if (error) throw error;
      
      // 2. Tenta remover a imagem do Storage (opcional, mas boa prática para não deixar lixo)
      if (item.image_url) {
        // Extrai o caminho relativo da URL completa
        // Ex: .../inventory-images/userid/123.jpg -> userid/123.jpg
        const path = item.image_url.split('/inventory-images/')[1];
        if (path) {
          await supabase.storage.from('inventory-images').remove([path]);
        }
      }

      setItems(items.filter(i => i.id !== item.id));
    } catch (error) {
      console.error(error);
    }
  };

  // Filtros
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todas' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Inventário Pessoal
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Catálogo com fotos e localização.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* --- CADASTRO --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ padding: '1.5rem', position: 'sticky', top: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Novo Item
            </h3>
            <form onSubmit={handleAddItem} style={{ display: 'grid', gap: '1rem' }}>
              
              {/* Área de Upload */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect}
                  style={{ display: 'none' }} 
                />
                
                {previewUrl ? (
                  <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                    />
                    <button 
                      type="button"
                      onClick={clearImage}
                      style={{ 
                        position: 'absolute', top: -5, right: -5, 
                        background: 'red', color: 'white', border: 'none', borderRadius: '50%', 
                        width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ 
                      width: '80px', height: '80px', borderRadius: '8px', border: '1px dashed var(--border-color)', 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      background: 'var(--bg-page)', cursor: 'pointer', color: 'var(--text-secondary)'
                    }}
                  >
                    <Camera size={24} />
                    <span style={{ fontSize: '0.7rem' }}>Foto</span>
                  </button>
                )}
                
                <div style={{ flex: 1 }}>
                  <Input 
                    label="Nome do Item" 
                    placeholder="Ex: Tênis de Corrida" 
                    value={name} onChange={e => setName(e.target.value)} 
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Select 
                  label="Categoria"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  options={[
                    { value: 'Geral', label: 'Geral' },
                    { value: 'Eletrônicos', label: 'Eletrônicos' },
                    { value: 'Cabos & Adaptadores', label: 'Cabos' },
                    { value: 'Roupas', label: 'Roupas' },
                    { value: 'Ferramentas', label: 'Ferramentas' },
                    { value: 'Livros', label: 'Livros' },
                    { value: 'Cozinha', label: 'Cozinha' },
                  ]}
                />
                <Input 
                  label="Qtd" 
                  type="number" 
                  value={quantity} onChange={e => setQuantity(e.target.value)} 
                  disabled={isSubmitting}
                />
              </div>

              <Input 
                label="Localização" 
                placeholder="Ex: Caixa 2 - Garagem" 
                value={location} onChange={e => setLocation(e.target.value)} 

                disabled={isSubmitting}
              />

              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Cadastrar Item'}
              </Button>
            </form>
          </Card>
        </div>

        {/* --- LISTA --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <Card style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input 
                placeholder="Buscar item..." 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}

              />
            </div>
            <div style={{ width: '180px' }}>
              <Select 
                value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                options={[{ value: 'Todas', label: 'Todas' }, ...uniqueCategories.map(c => ({ value: c, label: c }))]}
              />
            </div>
          </Card>

          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {filteredItems.map(item => (
              <Card key={item.id} style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Thumbnail da Imagem */}
                  <div style={{ 
                    width: '60px', height: '60px', borderRadius: '8px', 
                    backgroundColor: '#f1f5f9', overflow: 'hidden', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border-color)', flexShrink: 0
                  }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={24} color="var(--text-secondary)" />
                    )}
                  </div>
                  
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                      {item.name} 
                      {item.quantity > 1 && <span style={{ marginLeft: '8px', fontSize: '0.8rem', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px' }}>x{item.quantity}</span>}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={12} /> {item.category}
                      </span>
                      {item.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleRemove(item)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '0.5rem' }}
                >
                  <Trash2 size={18} className="hover:text-red-500" />
                </button>

              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}