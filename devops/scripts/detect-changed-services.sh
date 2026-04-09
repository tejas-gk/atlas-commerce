#!/usr/bin/env bash

set -euo pipefail

FORCE_REBUILD="${1:-false}"

backend_services=(
  "api-gateway"
  "auth-service"
  "product-service"
  "seller-service"
  "order-service"
  "admin-service"
  "chatting-service"
  "recommendation-service"
  "kafka-service"
  "logger-service"
  "ghast-chat-service"
)

frontend_services=(
  "web"
  "seller-ui"
  "admin-ui"
  "ghast-chat-web"
)

all_services=("${backend_services[@]}" "${frontend_services[@]}")

join_by_comma() {
  local IFS=","
  echo "$*"
}

if [[ "${FORCE_REBUILD}" == "true" ]]; then
  echo "BACKEND_SERVICES=$(join_by_comma "${backend_services[@]}")"
  echo "FRONTEND_SERVICES=$(join_by_comma "${frontend_services[@]}")"
  echo "ALL_SERVICES=$(join_by_comma "${all_services[@]}")"
  exit 0
fi

base_ref="${GIT_PREVIOUS_SUCCESSFUL_COMMIT:-HEAD~1}"
changed_files="$(git diff --name-only "${base_ref}" HEAD || true)"

shared_change=false
if echo "${changed_files}" | grep -Eq '^(package.json|pnpm-lock.yaml|pnpm-workspace.yaml|turbo.json|packages/|devops/|docker-compose|scripts/)'; then
  shared_change=true
fi

declare -a changed_backend=()
declare -a changed_frontend=()

if [[ "${shared_change}" == "true" ]]; then
  changed_backend=("${backend_services[@]}")
  changed_frontend=("${frontend_services[@]}")
else
  for service in "${backend_services[@]}"; do
    if echo "${changed_files}" | grep -Eq "^apps/${service}/"; then
      changed_backend+=("${service}")
    fi
  done

  for service in "${frontend_services[@]}"; do
    if echo "${changed_files}" | grep -Eq "^apps/${service}/"; then
      changed_frontend+=("${service}")
    fi
  done
fi

all_changed=("${changed_backend[@]}" "${changed_frontend[@]}")

echo "BACKEND_SERVICES=$(join_by_comma "${changed_backend[@]}")"
echo "FRONTEND_SERVICES=$(join_by_comma "${changed_frontend[@]}")"
echo "ALL_SERVICES=$(join_by_comma "${all_changed[@]}")"
