import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Monitor, Cpu, HardDrive, MemoryStick } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { PreBuiltPC } from '@/types/database';

// Use cliente público para tabelas não definidas nos tipos gerados
const supabasePublic = createClient(
  "https://btjullcrugzilpnxjoyr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0anVsbGNydWd6aWxwbnhqb3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzU1OTgsImV4cCI6MjA3Mjc1MTU5OH0.lBmJsUovvaIhf2dS9LNO1oRrk7ZPaGfCISJHwLlZu9Y"
);

const PreBuiltPCsList = () => {
  const [preBuiltPCs, setPreBuiltPCs] = useState<PreBuiltPC[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchPreBuiltPCs();
  }, []);

  const fetchPreBuiltPCs = async () => {
    try {
      const { data, error } = await supabasePublic
        .from('prebuilt_pcs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreBuiltPCs((data as PreBuiltPC[]) || []);
    } catch (error) {
      console.error('Erro ao buscar PCs prontos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (pc: PreBuiltPC) => {
    return profile?.setor === 'revenda' ? pc.price_revenda : pc.price_varejo;
  };

  const handleWhatsAppContact = (pc: PreBuiltPC) => {
    const price = getPrice(pc);
    const componentsList = Object.entries(pc.components)
      .filter(([, value]) => value.trim() !== '')
      .map(([key, value]) => `• ${key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}: ${value}`)
      .join('\n');

    const message = `Olá! Tenho interesse no PC pronto:

*${pc.name}*
Preço: R$ ${price.toFixed(2)}

*Componentes:*
${componentsList}

${pc.description ? `\n*Descrição:*\n${pc.description}` : ''}

Gostaria de mais informações e fazer o pedido!`;

    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (preBuiltPCs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Monitor className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum PC pronto disponível
          </h3>
          <p className="text-muted-foreground">
            Os PCs prontos para jogos ainda não foram cadastrados. Entre em contato conosco para mais informações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {preBuiltPCs.map((pc) => {
          const price = getPrice(pc);
          const mainComponents = [
            { key: 'processador', value: pc.components.processador, icon: Cpu },
            { key: 'memoria_ram', value: pc.components.memoria_ram, icon: MemoryStick },
            { key: 'armazenamento', value: pc.components.armazenamento, icon: HardDrive },
          ].filter(comp => comp.value.trim() !== '');

          return (
            <Card key={pc.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Image */}
                {pc.image_url ? (
                  <div className="h-48 bg-muted overflow-hidden">
                    <img
                      src={pc.image_url}
                      alt={pc.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-muted flex items-center justify-center">
                    <Monitor className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}

                <div className="p-6">
                  {/* Title and Price */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {pc.name}
                    </h3>
                    <div className="text-2xl font-bold text-primary">
                      R$ {price.toFixed(2)}
                    </div>
                  </div>

                  {/* Description */}
                  {pc.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {pc.description}
                    </p>
                  )}

                  {/* Main Components */}
                  <div className="space-y-2 mb-6">
                    {mainComponents.map(({ key, value, icon: Icon }) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}:
                        </span>
                        <span className="flex-1 truncate">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleWhatsAppContact(pc)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Solicitar via WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PreBuiltPCsList;