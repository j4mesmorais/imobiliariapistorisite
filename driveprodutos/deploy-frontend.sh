#!/usr/bin/env bash
# deploy-frontend.sh
#
# Deploy dos arquivos estáticos do Drive de Produtos para o site.
# Os arquivos estão em site/driveprodutos/ no repositório imobiliariapistorisite.
#
# Uso:
#   git add -A && git commit -m "..."
#   ./deploy-frontend.sh
#
# Pré-requisitos: git, ssh configurado para a VPS
set -euo pipefail

SITE_REPO="https://github.com/j4mesmorais/imobiliariapistorisite.git"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "========================================"
echo "  Deploy Frontend Drive de Produtos"
echo "  Repo:  imobiliariapistorisite"
echo "  Branch: ${CURRENT_BRANCH}"
echo "========================================"

# Verifica se há commits não enviados
UNPUSHED=$(git log origin/"${CURRENT_BRANCH}"..HEAD 2>/dev/null)
if [ -n "${UNPUSHED}" ]; then
  echo ""
  echo ">>> Commits não enviados para origin/${CURRENT_BRANCH}:"
  echo "${UNPUSHED}"
  echo ""
fi

# Push do código
if [ -n "${UNPUSHED}" ]; then
  echo "==> Enviando commits..."
  git push origin "${CURRENT_BRANCH}"
else
  echo "==> Nenhum commit novo para enviar."
fi

echo ""
echo "==> Acesse https://github.com/j4mesmorais/imobiliariapistorisite/actions"
echo "    e execute o workflow 'Deploy Site' (branch: main)"
echo ""
echo "    Ou faça deploy manual via SSH:"
echo "    ssh vps \"docker cp /tmp/site-drive/. \$(docker ps --filter name=site_site --format '{{.Names}}' | head -1):/usr/local/apache2/htdocs/driveprodutos/\""
echo "========================================"
