-- ============================================================
-- Drive de Produtos - Imobiliária Pistori
-- Inicialização do banco Supabase
-- ============================================================

-- 1. Categorias (tipo de informação do produto)
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icone TEXT DEFAULT ''
);

INSERT INTO categorias (nome, label, icone) VALUES
  ('contatos', 'Contatos', 'briefcase'),
  ('link',            'Link',              'link'),
  ('localizacao',     'Localização',       'map-pin'),
  ('documentos',      'Documentos',        'file-text'),
  ('info_adicionais', 'Informações Adicionais', 'info'),
  ('imagens_videos',  'Imagens e Vídeos',  'image'),
  ('outros',          'Outros',            'folder')
ON CONFLICT (nome) DO NOTHING;

-- 2. Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  imagem_perfil TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Itens (cada informação dentro de um produto)
CREATE TABLE IF NOT EXISTS itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('texto','link','arquivo','imagem','video','whatsapp','localizacao','contato')),
  conteudo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  ordem INT DEFAULT 0,
  origem TEXT DEFAULT 'manual',
  whatsapp_msg_id TEXT DEFAULT '',              -- key.id da mensagem original no WhatsApp
  anexos JSONB DEFAULT '[]',                    -- array de replies anexadas: [{"texto": "..."}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trigger para atualizar updated_at em produtos
CREATE OR REPLACE FUNCTION update_produtos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_produtos ON produtos;
CREATE TRIGGER trigger_update_produtos
  BEFORE UPDATE ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION update_produtos_updated_at();

-- 5. Indices
CREATE INDEX IF NOT EXISTS idx_itens_produto ON itens(produto_id);
CREATE INDEX IF NOT EXISTS idx_itens_categoria ON itens(categoria_id);
CREATE INDEX IF NOT EXISTS idx_itens_whatsapp_msg_id ON itens(whatsapp_msg_id);
CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos(slug);
