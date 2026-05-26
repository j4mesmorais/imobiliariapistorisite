
# Site - Imobiliária Pistori

## Repositório
- **GitHub:** `j4mesmorais/imobiliariapistorisite`
- **Branch:** main
- **Remote HTTPS:** `https://github.com/j4mesmorais/imobiliariapistorisite.git`
- **Conteúdo:** HTML estático (sem build tool) — HTML, CSS, JS, imagens

## Stack do Site
- **Servidor web:** Apache httpd (imagem `httpd:alpine`) no Docker Swarm
- **Orquestração:** Docker Swarm (1 réplica, node manager)
- **Proxy reverso:** Traefik v2.11 com Let's Encrypt (TLS)
- **Rede:** `traefik-public` (externa)
- **Volume persistente:** `site_html` mapeado em `/usr/local/apache2/htdocs/`

## Domínios
- `imobiliariapistori.com.br`
- `www.imobiliariapistori.com.br`

## Infraestrutura (VPS)
- **IP:** 187.77.52.12
- **Usuário SSH:** root
- **Sistema:** Ubuntu, Docker v29.4.2
- **Portainer:** https://portainer.imobiliariapistori.com.br
- **Stack ID no Portainer:** 5 (nome: "site")
- **Endpoint ID:** 1

## Deploy Local (via sync_site.py)
Para atualizar o site após alterações locais:

```bash
python3 deploy/sync_site.py
```

Isso tar.gz a pasta `site/`, envia por SSH e extrai no volume do container Apache.

## Deploy Manual via SSH
```bash
ssh root@187.77.52.12
docker ps --filter name=site_site --format '{{.ID}}' | head -1
```

Depois, localmente:
```bash
tar czf - -C site/ . | ssh root@187.77.52.12 "docker exec -i <CONTAINER_ID> tar xzf - -C /usr/local/apache2/htdocs/"
```

## Deploy com GitHub Actions (CI/CD)
Existe um workflow em `.github/workflows/deploy-site.yml` que:
1. Dispara em push na branch `main` com alterações em `site/**`
2. Faz checkout do repositório
3. Conecta via SSH na VPS (usando secrets)
4. Sincroniza os arquivos para o container Apache

### Secrets necessários no GitHub:
- `VPS_HOST`: `187.77.52.12`
- `VPS_USER`: `root`
- `SSH_KEY`: chave privada SSH
- `CONTAINER_NAME`: `site_site`

## Observações
- O site é estático (sem backend, sem banco de dados)
- SSL gerido automaticamente pelo Traefik + Let's Encrypt
- O container Apache não precisa ser reiniciado após sincronizar arquivos
- A autenticação git é feita via HTTPS com Git Credential Manager (usuário j4mesmorais)
