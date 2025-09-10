import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Eye, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { supabasePublic as supabase } from '@/integrations/supabase/publicClient';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: string;
  name: string;
  description?: string;
  price_varejo: number;
  price_revenda: number;
  image_url?: string;
  sku?: string;
  is_featured?: boolean;
}

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState(4);
  const { profile } = useAuth();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      console.log('🌟 Fetching featured products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true);

      if (error) {
        console.error('❌ Error fetching featured products:', error);
        // Try to get any products if featured query fails
        const { data: fallbackData } = await supabase
          .from('products')
          .select('*')
          .limit(8);
        setProducts(fallbackData || []);
      } else {
        console.log('✅ Featured products loaded:', data?.length || 0);
        setProducts(data || []);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      // Final fallback - try to load any products
      try {
        const { data: fallbackData } = await supabase
          .from('products')
          .select('*')
          .limit(8);
        setProducts(fallbackData || []);
      } catch (finalError) {
        console.error('❌ Final fallback failed:', finalError);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = (product?: Product) => {
    const phoneNumber = '558534833373';
    const message = product 
      ? `Olá! Gostaria de saber mais sobre o produto: ${product.name} (SKU: ${product.sku})`
      : 'Olá! Gostaria de saber mais sobre os produtos da KECINFORSTORE.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleProductClick = (product: Product) => {
    navigate(`/produto/${product.id}`);
  };

  const getPrice = (product: Product) => {
    return profile?.setor === 'revenda' ? product.price_revenda : product.price_varejo;
  };

  const currentProducts = products.slice(0, visibleProducts);
  const hasMoreProducts = visibleProducts < products.length;

  const loadMoreProducts = () => {
    setVisibleProducts(prev => Math.min(prev + 4, products.length));
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Produtos em destaque
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Os produtos mais desejados com os melhores preços e qualidade garantida
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-6 bg-gray-200 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Produtos em destaque
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Em breve novos produtos em destaque
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Produtos em destaque
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Os produtos mais desejados com os melhores preços e qualidade garantida
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-6">
          {currentProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer flex flex-col h-full">
              <div className="relative w-full h-32 sm:h-48" onClick={() => handleProductClick(product)}>
                <img 
                  src={product.image_url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1 py-0 sm:top-3 sm:left-3 sm:px-2 sm:py-1">
                  Destaque
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-foreground opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 sm:w-8 sm:h-8 sm:top-3 sm:right-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product);
                  }}
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                {product.sku && (
                  <Badge className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 py-0 sm:bottom-3 sm:right-3 sm:px-2 sm:py-1">
                    {product.sku}
                  </Badge>
                )}
              </div>

              <CardContent className="p-2 sm:p-4 flex flex-col flex-1 justify-between min-h-[120px] sm:min-h-[200px]">
                <div className="flex-1">
                  <h3 className="font-medium text-xs sm:text-base text-foreground mb-1 sm:mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-2" 
                      onClick={() => handleProductClick(product)}>
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1 sm:line-clamp-2 hidden sm:block">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:space-y-3 mt-auto">
                  <div>
                    <div className="text-sm sm:text-xl font-bold text-primary">
                      R$ {getPrice(product).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {profile?.setor === 'revenda' && (
                      <div className="text-xs text-green-600 font-medium">
                        Preço Revenda
                      </div>
                    )}
                  </div>

                  <Button 
                    className="bg-gradient-primary hover:opacity-90 font-medium w-full h-7 sm:h-10 text-xs sm:text-sm"
                    onClick={() => handleWhatsAppContact(product)}
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Consultar</span>
                    <span className="sm:hidden">Comprar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botões para carregar mais produtos ou ver todos */}
        <div className="flex justify-center mt-8">
          {hasMoreProducts ? (
            <Button 
              onClick={loadMoreProducts}
              className="bg-gradient-primary hover:opacity-90 font-semibold px-8 h-12"
            >
              Ver Mais Produtos em Destaque
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/produtos')}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 h-12"
            >
              Ver Todos os Produtos
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
