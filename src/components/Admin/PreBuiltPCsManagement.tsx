import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import type { PreBuiltPC } from '@/types/database';

interface Product {
  id: string;
  name: string;
  category_id: string | null;
}

const PreBuiltPCsManagement = () => {
  const [preBuiltPCs, setPreBuiltPCs] = useState<PreBuiltPC[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPC, setEditingPC] = useState<PreBuiltPC | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    fetchProducts();
  }, []);

  const fetchPreBuiltPCs = async () => {
    try {
      const { data, error } = await (supabasePublic as any)
        .from('prebuilt_pcs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreBuiltPCs((data as PreBuiltPC[]) || []);
    } catch (error) {
      console.error('Erro ao buscar PCs prontos:', error);
      toast.error('Erro ao carregar PCs prontos');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabasePublic
        .from('products')
        .select('id, name, category_id')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingPC) {
        const { error } = await (supabasePublic as any)
          .from('prebuilt_pcs')
          .update(formData)
          .eq('id', editingPC.id);

        if (error) throw error;
        toast.success('PC atualizado com sucesso!');
      } else {
        const { error } = await (supabasePublic as any)
          .from('prebuilt_pcs')
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
      const { error } = await (supabasePublic as any)
        .from('prebuilt_pcs')
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await (supabasePublic as any).storage
        .from('prebuilt-pcs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = (supabasePublic as any).storage
        .from('prebuilt-pcs')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const getProductsByCategory = (categoryName: string) => {
    return products.filter(product => {
      if (!product.category_id) return false;
      // Simplificado: buscar produtos que contenham parte do nome da categoria
      return product.name.toLowerCase().includes(categoryName.toLowerCase());
    });
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
                <Label htmlFor="image_url">Imagem do PC</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="URL da imagem ou faça upload"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Enviando...' : 'Upload'}
                    </Button>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {formData.image_url && (
                    <div className="h-32 w-32 rounded-lg overflow-hidden border">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
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
              {Object.entries(formData.components).map(([key, value]) => {
                const categoryProducts = getProductsByCategory(key);
                
                return (
                  <div key={key}>
                    <Label htmlFor={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                    </Label>
                    <Select
                      value={value}
                      onValueChange={(newValue) => setFormData(prev => ({
                        ...prev,
                        components: {
                          ...prev.components,
                          [key]: newValue
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Selecione ${key.replace('_', ' ')}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryProducts.length > 0 ? (
                          categoryProducts.map((product) => (
                            <SelectItem key={product.id} value={product.name}>
                              {product.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            Nenhum produto encontrado
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
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