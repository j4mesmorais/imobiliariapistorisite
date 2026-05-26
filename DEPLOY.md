# Deploy — Site (imobiliariapistori.com.br)

## Git
```bash
git add -A
git commit -m "descrição"
git push
```

## Deploy para produção
1. Vá em https://github.com/j4mesmorais/imobiliariapistorisite/actions
2. Clique em **Deploy Site**
3. Clique em **Run workflow** > **Run workflow**

O GitHub Actions vai:
- Fazer SSH na VPS
- Copiar os arquivos via SCP
- Sincronizar com o container Apache (`site_site`)

## URL
https://imobiliariapistori.com.br
