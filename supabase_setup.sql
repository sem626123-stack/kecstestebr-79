-- ===========================
-- CONFIGURAÇÃO COMPLETA PARA PCS PRONTOS
-- ===========================

-- 1. CRIAR TABELA PREBUILT_PCS (se ainda não existir)
CREATE TABLE IF NOT EXISTS prebuilt_pcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_varejo DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_revenda DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    components JSONB NOT NULL DEFAULT '{
        "gabinete": "",
        "processador": "",
        "placa_mae": "",
        "memoria_ram": "",
        "cooler": "",
        "fonte": "",
        "armazenamento": "",
        "mouse": "",
        "teclado": "",
        "monitor": "",
        "mouse_pad": ""
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_prebuilt_pcs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. CRIAR TRIGGER PARA PREBUILT_PCS
DROP TRIGGER IF EXISTS update_prebuilt_pcs_updated_at ON prebuilt_pcs;
CREATE TRIGGER update_prebuilt_pcs_updated_at
    BEFORE UPDATE ON prebuilt_pcs
    FOR EACH ROW
    EXECUTE FUNCTION update_prebuilt_pcs_updated_at();

-- 4. HABILITAR RLS (ROW LEVEL SECURITY)
ALTER TABLE prebuilt_pcs ENABLE ROW LEVEL SECURITY;

-- 5. REMOVER POLÍTICAS EXISTENTES (se houver)
DROP POLICY IF EXISTS "Admin can manage prebuilt PCs" ON prebuilt_pcs;
DROP POLICY IF EXISTS "Everyone can read prebuilt PCs" ON prebuilt_pcs;

-- 6. CRIAR POLÍTICAS PARA PREBUILT_PCS
-- Política para admin gerenciar PCs prontos
CREATE POLICY "Admin can manage prebuilt PCs" ON prebuilt_pcs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Política para todos lerem PCs prontos
CREATE POLICY "Everyone can read prebuilt PCs" ON prebuilt_pcs
    FOR SELECT USING (true);

-- ===========================
-- CONFIGURAÇÃO DE STORAGE PARA IMAGENS
-- ===========================

-- 7. CRIAR BUCKET PARA IMAGENS DOS PCS PRONTOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('prebuilt-pcs', 'prebuilt-pcs', true)
ON CONFLICT (id) DO NOTHING;

-- 8. CRIAR POLÍTICAS DE STORAGE
-- Política para admin fazer upload de imagens
CREATE POLICY "Admin can upload prebuilt PC images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'prebuilt-pcs' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Política para admin deletar imagens
CREATE POLICY "Admin can delete prebuilt PC images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'prebuilt-pcs' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Política para todos verem as imagens
CREATE POLICY "Everyone can view prebuilt PC images" ON storage.objects
    FOR SELECT USING (bucket_id = 'prebuilt-pcs');

-- ===========================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ===========================

-- 9. INSERIR ALGUNS PCS PRONTOS DE EXEMPLO (opcional)
INSERT INTO prebuilt_pcs (name, description, price_varejo, price_revenda, components)
VALUES 
(
    'PC Gamer Entry Level',
    'PC ideal para jogos em 1080p com boa performance',
    2500.00,
    2200.00,
    '{
        "gabinete": "Gabinete Gamer RGB",
        "processador": "AMD Ryzen 5 4600G",
        "placa_mae": "Placa Mãe A520M",
        "memoria_ram": "16GB DDR4 3200MHz",
        "cooler": "Cooler Box AMD",
        "fonte": "Fonte 500W 80+ Bronze",
        "armazenamento": "SSD 480GB",
        "mouse": "Mouse Gamer RGB",
        "teclado": "Teclado Mecânico RGB",
        "monitor": "Monitor 24\" Full HD",
        "mouse_pad": "Mouse Pad Gamer XL"
    }'::jsonb
),
(
    'PC Gamer Mid Range',
    'PC para jogos em alta qualidade e streaming',
    4200.00,
    3800.00,
    '{
        "gabinete": "Gabinete ATX RGB Vidro Temperado",
        "processador": "AMD Ryzen 5 5600X",
        "placa_mae": "Placa Mãe B450M Pro",
        "memoria_ram": "32GB DDR4 3200MHz",
        "cooler": "Water Cooler 240mm",
        "fonte": "Fonte 650W 80+ Bronze Modular",
        "armazenamento": "SSD 1TB NVMe",
        "mouse": "Mouse Gamer Pro RGB",
        "teclado": "Teclado Mecânico Pro RGB",
        "monitor": "Monitor 27\" 144Hz",
        "mouse_pad": "Mouse Pad Gamer XXL RGB"
    }'::jsonb
),
(
    'PC Gamer High End',
    'PC top de linha para jogos em 4K e trabalho profissional',
    8500.00,
    7500.00,
    '{
        "gabinete": "Gabinete Full Tower RGB Premium",
        "processador": "AMD Ryzen 7 5800X3D",
        "placa_mae": "Placa Mãe X570 Gaming Plus",
        "memoria_ram": "32GB DDR4 3600MHz RGB",
        "cooler": "Water Cooler 360mm RGB",
        "fonte": "Fonte 850W 80+ Gold Modular",
        "armazenamento": "SSD 2TB NVMe Gen4",
        "mouse": "Mouse Gamer Wireless Pro",
        "teclado": "Teclado Mecânico Premium RGB",
        "monitor": "Monitor 32\" 4K 144Hz",
        "mouse_pad": "Mouse Pad Premium XXL"
    }'::jsonb
)
ON CONFLICT DO NOTHING;

-- ===========================
-- VERIFICAÇÕES FINAIS
-- ===========================

-- 10. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
SELECT 'Tabela prebuilt_pcs criada com sucesso!' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'prebuilt_pcs'
);

SELECT 'Storage bucket criado com sucesso!' as status
WHERE EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'prebuilt-pcs'
);

-- Mostrar quantos PCs prontos existem
SELECT COUNT(*) as total_prebuilt_pcs FROM prebuilt_pcs;

-- ===========================
-- INSTRUÇÕES ADICIONAIS
-- ===========================

/*
INSTRUÇÕES IMPORTANTES:

1. Execute este SQL no editor SQL do Supabase Dashboard
2. Certifique-se de que a tabela 'profiles' já existe com a coluna 'is_admin'
3. O storage bucket será público para visualização, mas apenas admins podem fazer upload
4. As imagens serão armazenadas em: https://[seu-projeto].supabase.co/storage/v1/object/public/prebuilt-pcs/[nome-arquivo]
5. Tamanho máximo por arquivo: 50MB (padrão do Supabase)
6. Formatos aceitos: JPG, PNG, WebP, GIF

PARA LIMITAR O TAMANHO DOS ARQUIVOS:
- Vá em Storage > Settings no Dashboard do Supabase
- Configure o tamanho máximo por arquivo conforme necessário

PARA CONFIGURAR CATEGORIAS AUTOMÁTICAS:
- Certifique-se de que sua tabela 'products' tem categorias bem definidas
- Os componentes serão filtrados automaticamente por nome/categoria
*/