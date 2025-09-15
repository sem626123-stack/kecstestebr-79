import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { StoreSettings } from '@/types/database';

// Use cliente público para tabelas não definidas nos tipos gerados
const supabasePublic = createClient(
  "https://btjullcrugzilpnxjoyr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0anVsbGNydWd6aWxwbnhqb3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzU1OTgsImV4cCI6MjA3Mjc1MTU5OH0.lBmJsUovvaIhf2dS9LNO1oRrk7ZPaGfCISJHwLlZu9Y"
);

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
      const { data, error } = await supabasePublic
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