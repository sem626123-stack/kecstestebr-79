import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Package, Image, Tags, Users, Star, Settings, Key } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProductManagement from './ProductManagement';
import BannerManagement from './BannerManagement';
import CategoryManagement from './CategoryManagement';
import ClientManagement from './ClientManagement';
import FeaturedProductsManagement from './FeaturedProductsManagement';
import StoreCredentialsManagement from './StoreCredentialsManagement';
import StoreSettingsManagement from './StoreSettingsManagement';
import PreBuiltPCsManagement from './PreBuiltPCsManagement';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const { signOut, profile } = useAuth();

  const tabs = [
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'categories', label: 'Categorias', icon: Tags },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'featured', label: 'Destaques', icon: Star },
    { id: 'prebuilt', label: 'PCs Prontos', icon: Package },
    { id: 'credentials', label: 'Credenciais', icon: Key },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    onBack();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              KECINFORSTORE - Admin
            </h1>
            <p className="text-muted-foreground">
              Olá, {profile?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              Voltar ao Site
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="products">
              <ProductManagement />
            </TabsContent>

            <TabsContent value="featured">
              <FeaturedProductsManagement />
            </TabsContent>

            <TabsContent value="banners">
              <BannerManagement />
            </TabsContent>

            <TabsContent value="categories">
              <CategoryManagement />
            </TabsContent>

            <TabsContent value="clients">
              <ClientManagement />
            </TabsContent>

            <TabsContent value="credentials">
              <StoreCredentialsManagement />
            </TabsContent>

            <TabsContent value="settings">
              <StoreSettingsManagement />
            </TabsContent>
            
            <TabsContent value="prebuilt">
              <PreBuiltPCsManagement />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;