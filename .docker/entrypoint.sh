#!/bin/bash

CONFIG_FILE="/usr/share/nginx/html/config.json"
ENV_PATH="/app/.env"

# Carregar variáveis de ambiente do .env, permite alteração da variável de ambiente direto no Rancher
if [ -z "$CONFIG_URL" ] && [ -f "$ENV_PATH" ]; then
  echo "Carregando variáveis de ambiente de $ENV_PATH"
  set -a
  . "$ENV_PATH"
  set +a
else
  echo "Arquivo .env não encontrado em $ENV_PATH"
fi

# Função de substituição
search_replace () {
  local search=$1
  local replace=$2
  local file=$3

  if [ -n "${file}" ] && [ -n "${replace}" ]; then
    echo -n "Substituindo '$search' por '$replace' em $file..."
    sed -i "s|${search}|${replace}|g" "$file"
    echo " [OK]"
  else
    echo "Erro: variável de ambiente para '$search' não está definida"
  fi
}

echo "Substituindo variáveis no config.json"
search_replace "{{URL}}" "${CONFIG_URL}" "$CONFIG_FILE"

echo "Iniciando NGINX"
nginx -g "daemon off;"
