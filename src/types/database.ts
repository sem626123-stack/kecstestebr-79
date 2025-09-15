// Tipos customizados para tabelas não definidas em types.ts
export interface PreBuiltPC {
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
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  enable_sales: boolean;
  created_at: string;
  updated_at: string;
}