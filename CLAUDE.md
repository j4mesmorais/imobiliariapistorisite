# Site Imobiliária Pistori — Contexto de Deploy

## Repositório

- **URL**: https://github.com/j4mesmorais/imobiliariapistorisite
- **Remote**: `origin → https://github.com/j4mesmorais/imobiliariapistorisite.git`
- **Branch**: `main`

## Fluxo de Deploy

1. `git add -A`
2. `git commit -m "mensagem"`
3. `git push origin main`
4. Acessar https://github.com/j4mesmorais/imobiliariapistorisite/actions → workflow "Deploy Site" → "Run workflow" (branch: main)
5. O workflow faz SCP dos arquivos para a VPS e executa `docker cp` no container Apache

## Container Apache na VPS

- Nome: `site_site.1.rw5nyek1tg9rvhvelhk1yvw7z`
- Document root: `/usr/local/apache2/htdocs/`

## ⚠️ Importante

A pasta `site/` LOCAL contém **mais arquivos** que o GitHub (imagens, diretório `mapa/` com backups, etc.).
**NÃO** clone o repositório do zero para fazer deploy — você perderia arquivos. Sempre trabalhe na pasta `site/` local e faz commit+push.

## Apache Reverse Proxy (httpd-proxy.conf)

O arquivo `httpd-proxy.conf` contém a config de reverse proxy do Apache (mod_proxy) para serviços internos no Docker Swarm.

**O proxy config agora é bakeado na imagem Docker** (`site-docker/Dockerfile` copia o arquivo + `httpd.conf` já inclui o `Include`). Isso significa que:
- A imagem já nasce com o proxy configurado
- Qualquer container que subir a partir dela já tem o proxy funcionando
- **Não precisa mais de comandos manuais pós-deploy**

### Fluxo para modificar o proxy

1. Edite `site/httpd-proxy.conf` (source of truth)
2. Copie para `site-docker/httpd-proxy.conf`
3. Faça rebuild da imagem Docker:
   ```bash
   docker build -t site-httpd-php:latest site-docker/
   ```
4. Faça deploy: `docker stack deploy -c stacks/site.yml site`

Ver documentação detalhada em `MEDIA-PROXY.md`.

## Acesso SSH (VPS)

```bash
ssh vps
```
(O host `vps` está configurado em `~/.ssh/config` com ProxyCommand via Cloudflare Tunnel)
