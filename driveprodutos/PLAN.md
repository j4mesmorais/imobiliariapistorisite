# Drive de Produtos — Imobiliária Pistori

## Visão Geral

Pagina HTML para visualizar material de propaganda, informações e marketing de cada produto
imobiliario. Os dados sao armazenados no Supabase (metadados) e os arquivos no NextCloud via WebDAV.

## Fluxo

```
WhatsApp -> Evolution API -> Webhook (Python) -> Ollama (categorizar) -> Supabase + NextCloud
Browser  -> Pagina HTML   -> Supabase REST    -> dados + arquivos
```

## Arquitetura

### Supabase — Tabelas

- `produtos` — id, nome, slug, imagem_perfil, created_at, updated_at
- `categorias` — id, nome (enum), label (ex: "Gerente de Vendas")
- `itens` — id, produto_id FK, categoria_id FK, tipo (texto/link/arquivo/imagem/video/whatsapp),
  conteudo, descricao, ordem, origem (webhook/manual), created_at

### NextCloud — Storage

```
/Documents/Matriz/2026/Produtos/<NomeProduto>/
  perfil.jpg
  documentos/
  imagens/
  videos/
  outros/
```

### Pagina HTML

- `index.html` — listagem de todos os produtos
- `produto.html` — detalhe de um produto (categorias + itens)
- Tecnologia: HTML + CSS + JS puro (sem framework)
- Dados via Supabase REST API (anon key)
- Deploy no Apache (volume `site_html` da Swarm)

### Webhook (futuro)

- Servico Python em Docker Swarm
- Recebe eventos do Evolution API (grupo Pistori.Teste)
- Chama Ollama (qwen2.5vl:3b) para categorizar
- Salva no Supabase + upload para NextCloud

## Acesso

- **Listagem de produtos:** [https://imobiliariapistori.com.br/driveprodutos/](https://imobiliariapistori.com.br/driveprodutos/)
- **Detalhe do produto:** [https://imobiliariapistori.com.br/driveprodutos/produto.html?slug=<slug>](https://imobiliariapistori.com.br/driveprodutos/produto.html?slug=<slug>)

## Fases

| Fase | Descricao | Status |
|------|-----------|--------|
| F1   | DB Supabase (tabelas) | Concluido |
| F2   | Pagina HTML (layout + dados mockados) | Concluido |
| F3   | Pagina HTML (conectada ao Supabase REST) | Concluido |
| F4   | Deploy no Apache (volume site_html) | Concluido |
| F5   | Webhook Python (receber eventos Evolution) | Concluido |
| F6   | Webhook + Ollama (categorizar) | Concluido |
| F7   | Webhook + Supabase + NextCloud | Concluido |
| F8   | Configurar Webhook no Evolution API | Concluido |

## Decisoes

- Backend webhook: Python (prototipacao rapida)
- Storage: NextCloud via WebDAV
- Autenticacao: publico (material de propaganda)
