import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface PreBuiltPC {
  id: string;
  name: string;
  description: string;
  price_varejo: number;
  price_revenda: number;
  image_url?: string;
  components: {
    gabinete: string;
    processador: string;
    placa_mae: string;
    memoria_ram: string;
    cooler: string;
    fonte: string;
    armazenamento: string;
    mouse: string;
    teclado: string;
    monitor: string;
    mouse_pad: string;
  };
  created_at: string;
}

const PreBuiltPCsManagement = () => {
  const [preBuiltPCs, setPreBuiltPCs] = useState<PreBuiltPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPC, setEditingPC] = useState<PreBuiltPC | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_varejo: 0,
    price_revenda: 0,
    image_url: '',
    components: {
      gabinete: '',
      processador: '',
      placa_mae: '',
      memoria_ram: '',
      cooler: '',
      fonte: '',
      armazenamento: '',
      mouse: '',
      teclado: '',
      monitor: '',
      mouse_pad: ''
    }
  });

  useEffect(() => {
    fetchPreBuiltPCs();
  }, []);

  const fetchPreBuiltPCs = async () => {
    try {
      const { data, error } = await supabase
        .from('prebuilt_pcs' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreBuiltPCs((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar PCs prontos:', error);
      toast.error('Erro ao carregar PCs prontos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingPC) {
        const { error } = await supabase
          .from('prebuilt_pcs' as any)
          .update(formData)
          .eq('id', editingPC.id);

        if (error) throw error;
        toast.success('PC atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('prebuilt_pcs' as any)
          .insert(formData);

        if (error) throw error;
        toast.success('PC criado com sucesso!');
      }

      setShowForm(false);
      setEditingPC(null);
      resetForm();
      fetchPreBuiltPCs();
    } catch (error) {
      console.error('Erro ao salvar PC:', error);
      toast.error('Erro ao salvar PC');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este PC?')) return;

    try {
      const { error } = await supabase
        .from('prebuilt_pcs' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('PC excluído com sucesso!');
      fetchPreBuiltPCs();
    } catch (error) {
      console.error('Erro ao excluir PC:', error);
      toast.error('Erro ao excluir PC');
    }
  };

  const handleEdit = (pc: PreBuiltPC) => {
    setEditingPC(pc);
    setFormData({
      name: pc.name,
      description: pc.description,
      price_varejo: pc.price_varejo,
      price_revenda: pc.price_revenda,
      image_url: pc.image_url || '',
      components: pc.components
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_varejo: 0,
      price_revenda: 0,
      image_url: '',
      components: {
        gabinete: '',
        processador: '',
        placa_mae: '',
        memoria_ram: '',
        cooler: '',
        fonte: '',
        armazenamento: '',
        mouse: '',
        teclado: '',
        monitor: '',
        mouse_pad: ''
      }
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPC(null);
    resetForm();
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">PCs Prontos para Jogos</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo PC
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPC ? 'Editar PC' : 'Novo PC'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do PC</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: PC Gamer RTX 4060"
                />
              </div>
              <div>
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do PC..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_varejo">Preço Varejo (R$)</Label>
                <Input
                  id="price_varejo"
                  type="number"
                  value={formData.price_varejo}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_varejo: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="price_revenda">Preço Revenda (R$)</Label>
                <Input
                  id="price_revenda"
                  type="number"
                  value={formData.price_revenda}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_revenda: Number(e.target.value) }))}
                />
              </div>
            </div>

            <Separator />
            <h3 className="text-lg font-semibold">Componentes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.components).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                  </Label>
                  <Input
                    id={key}
                    value={value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      components: {
                        ...prev.components,
                        [key]: e.target.value
                      }
                    }))}
                    placeholder={`Nome do ${key.replace('_', ' ')}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {preBuiltPCs.map((pc) => (
          <Card key={pc.id}>
            <CardContent className="p-4">
              {pc.image_url && (
                <div className="h-32 mb-4 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={pc.image_url}
                    alt={pc.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <h3 className="font-semibold mb-2">{pc.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {pc.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm">Varejo:</span>
                  <Badge variant="secondary">R$ {pc.price_varejo.toFixed(2)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Revenda:</span>
                  <Badge variant="secondary">R$ {pc.price_revenda.toFixed(2)}</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(pc)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(pc.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {preBuiltPCs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum PC pronto cadastrado ainda.</p>
        </div>
      )}
    </div>
  );
};

export default PreBuiltPCsManagement;