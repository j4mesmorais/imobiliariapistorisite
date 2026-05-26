
# Site - Imobiliária Pistori

## Repositório
- **GitHub:** https://github.com/imobiliariapistori/imobiliariapistori.github.io.git
- **Branch:** main
- **Conteúdo:** HTML estático (sem build tool) — HTML, CSS, JS, imagens

## Stack do Site
- **Servidor web:** Apache httpd (imagem `httpd:alpine`)
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

## Deploy
Para atualizar o site após alterações locais:

1. Os arquivos do site estão na pasta `site/` deste projeto
2. Conecte via SSH: `ssh root@187.77.52.12`
3. Descubra o container: `docker ps --filter name=site_site --format '{{.ID}}' | head -1`
4. Sincronize os arquivos:
   ```bash
   tar czf - -C site/ . | ssh root@187.77.52.12 "docker exec -i <CONTAINER_ID> tar xzf - -C /usr/local/apache2/htdocs/"
   ```
5. Ou use o script: `python3 deploy/sync_site.py`
6. Para recriar a stack (se necessário): `python3 deploy/deploy_site.py` ou `python3 deploy/update_site_stack.py`

## Observações
- O site é estático (sem backend, sem banco de dados)
- SSL gerido automaticamente pelo Traefik + Let's Encrypt
- O container Apache não precisa ser reiniciado após sincronizar arquivos
