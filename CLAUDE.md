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

O arquivo `site/httpd-proxy.conf` contém a config de reverse proxy do Apache para serviços internos no Docker Swarm (atualmente media-api).

**Após cada deploy**, é necessário copiá-lo para o container e fazer graceful reload:

```bash
# SSH na VPS e executar:
docker cp httpd-proxy.conf site_site.1.<container-id>:/usr/local/apache2/conf/httpd-proxy.conf
docker exec site_site.1.<container-id> sh -c "grep -q 'httpd-proxy.conf' /usr/local/apache2/conf/httpd.conf || echo 'Include conf/httpd-proxy.conf' >> /usr/local/apache2/conf/httpd.conf"
docker exec site_site.1.<container-id> httpd -k graceful
```

Ver documentação detalhada em `MEDIA-PROXY.md`.

## Acesso SSH (VPS)

```bash
ssh vps
```
(O host `vps` está configurado em `~/.ssh/config` com ProxyCommand via Cloudflare Tunnel)
