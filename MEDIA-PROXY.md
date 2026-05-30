# Apache Reverse Proxy para Media Resources

## Problema

Serviços de mídia (APIs, storage, processamento) normalmente precisam ser acessados pelo frontend, mas expô-los publicamente via subdomínio/Traefik cria:

1. **CORS** — Cada serviço precisa configurar CORS para aceitar requisições do domínio principal
2. **DNS público** — O frontend depende de resolução DNS externa
3. **Superfície de ataque** — Cada subdomínio é um ponto de entrada público
4. **Certificados SSL** — Cada subdomínio precisa de certificado próprio (LetsEncrypt)

## Solução: Apache Reverse Proxy

O Apache do container `site` (imagem `httpd:alpine`) faz proxy reverso para serviços internos no Docker Swarm, usando `mod_proxy` e `mod_proxy_http`. O frontend acessa tudo via **same-origin** (`/api/media/...`), sem CORS, sem DNS externo.

```
Browser → https://imobiliariapistori.com.br/api/media/
  → Apache (mod_proxy) → http://media-api:8080/api/media/
    → NextCloud WebDAV (interno)
```

## Arquivos

- **`site/httpd-proxy.conf`** — Configuração Apache (código fonte no repositório)
- **No container:** `/usr/local/apache2/conf/httpd-proxy.conf` (copiado via `docker cp`)
- **Include em:** `/usr/local/apache2/conf/httpd.conf` (adicionado via `echo >>` durante deploy)

## Pré-requisitos

Para que o proxy funcione, o **container de destino** precisa estar na **mesma Docker overlay network** que o container `site`. Atualmente o `site` está na rede `traefik-public`.

Verificar se um serviço está acessível:

```bash
# De dentro do container site, testar resolução DNS
docker exec site_container sh -c "getent hosts media-api"
# Deve retornar um IP (ex: 10.0.1.x)

# Testar conectividade HTTP
docker exec site_container sh -c "curl -s http://media-api:8080/api/media/list?path=Documents/Site/Imagens&type=image | head -c 200"
```

## Como Adicionar um Novo Upstream

1. **Conecte o container à rede do site** — No `stack.yml` do serviço, adicione:
   ```yaml
   networks:
     - traefik-public   # mesma rede do site
   ```
   (A rede precisa ser declarada como `external: true`)

2. **Adicione o ProxyPass** em `site/httpd-proxy.conf`:
   ```apache
   ProxyPass /api/novo-recurso/ http://meu-servico:8080/api/origem/
   ProxyPassReverse /api/novo-recurso/ http://meu-servico:8080/api/origem/
   ```

3. **Atualize o container**:
   ```bash
   docker cp httpd-proxy.conf site_container:/usr/local/apache2/conf/httpd-proxy.conf
   docker exec site_container httpd -k graceful
   ```

4. **No frontend**, use caminho absoluto:
   ```js
   fetch('/api/novo-recurso/list')
   ```

## Exemplos

| Recurso | ProxyPass | Serviço Interno |
|---------|-----------|-----------------|
| Imagens (media-api) | `/api/media/` → `http://media-api:8080/api/media/` | media-api:8080 |
| *(futuro)* Vídeos | `/api/videos/` → `http://video-svc:9000/api/` | video-svc:9000 |
| *(futuro)* Documentos | `/api/docs/` → `http://doc-svc:3000/` | doc-svc:3000 |

## Notas

- O `httpd-proxy.conf` no repositório é a **fonte da verdade** (source of truth). Mudancas manuais no container **não persistem** se o container for recriado.
- A imagem `httpd:alpine` inclui `mod_proxy` e `mod_proxy_http` porém desabilitados. O `LoadModule` no `httpd-proxy.conf` os ativa.
- Para reload sem downtime: `docker exec site_container httpd -k graceful`
- O container `site` usa IP fixo 10.0.1.14 na rede `traefik-public`.
