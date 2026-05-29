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

## Acesso SSH (VPS)

```bash
ssh vps
```
(O host `vps` está configurado em `~/.ssh/config` com ProxyCommand via Cloudflare Tunnel)
