import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import type { StoreSettings } from '@/types/database';

const StoreSettingsManagement = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await (supabasePublic as any)
        .from('store_settings')
        .select('*')
        .single();

      if (error) {
        // Se não existir configuração, criar uma
        const { data: newData, error: insertError } = await (supabasePublic as any)
          .from('store_settings')
          .insert({ enable_sales: false })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData as StoreSettings);
      } else {
        setSettings(data as StoreSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações da loja');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (enable_sales: boolean) => {
    if (!settings) return;

    try {
      const { error } = await (supabasePublic as any)
        .from('store_settings')
        .update({ enable_sales })
        .eq('id', settings.id);

      if (error) throw error;
      
      setSettings({ ...settings, enable_sales });
      toast.success('Configurações atualizadas com sucesso!');
      
      // Dispara evento para atualizar outros componentes
      window.dispatchEvent(new CustomEvent('storeSettingsChanged', { 
        detail: { ...settings, enable_sales }
      }));
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Loja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sales-toggle" className="text-base">
              Vendas Online
            </Label>
            <div className="text-[0.8rem] text-muted-foreground">
              Ative para permitir que clientes adicionem produtos ao carrinho e finalizem pedidos via WhatsApp
            </div>
          </div>
          <Switch
            id="sales-toggle"
            checked={settings?.enable_sales || false}
            onCheckedChange={updateSettings}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreSettingsManagement;