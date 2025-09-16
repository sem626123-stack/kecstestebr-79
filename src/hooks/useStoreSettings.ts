import { useState, useEffect } from 'react';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import type { StoreSettings } from '@/types/database';

export const useStoreSettings = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    
    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent) => {
      setSettings(event.detail);
    };
    
    window.addEventListener('storeSettingsChanged', handleSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('storeSettingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await (supabasePublic as any)
        .from('store_settings')
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error loading store settings:', error);
        // Use default settings if error
        setSettings({ 
          id: '', 
          enable_sales: false, 
          created_at: '', 
          updated_at: '' 
        });
        return;
      }

      setSettings(data as StoreSettings);
      console.log('✅ Store settings loaded:', data);
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      setSettings({ 
        id: '', 
        enable_sales: false, 
        created_at: '', 
        updated_at: '' 
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    setLoading(true);
    fetchSettings();
  };

  return {
    settings,
    loading,
    refreshSettings,
    salesEnabled: settings?.enable_sales || false
  };
};