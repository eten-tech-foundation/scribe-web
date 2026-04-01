#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Runtime detection (prefer Podman) ──────────────────────────────────────────

detect_runtime() {
  if command -v podman &>/dev/null && command -v podman-compose &>/dev/null; then
    COMPOSE_CMD="podman-compose"
  elif command -v docker &>/dev/null && docker compose version &>/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
  elif command -v docker &>/dev/null && command -v docker-compose &>/dev/null; then
    COMPOSE_CMD="docker-compose"
  else
    echo "Error: No container runtime found."
    echo "Install one of:"
    echo "  - Podman + podman-compose"
    echo "  - Docker Desktop (includes docker compose V2)"
    echo "  - Docker Engine + docker-compose"
    exit 1
  fi
}

detect_runtime

# ── Commands ───────────────────────────────────────────────────────────────────

cmd="${1:-help}"
shift || true

case "$cmd" in
  up)
    $COMPOSE_CMD up -d --build "$@"
    ;;
  down)
    $COMPOSE_CMD down "$@"
    ;;
  restart)
    $COMPOSE_CMD restart "$@"
    ;;
  logs)
    $COMPOSE_CMD logs -f "$@"
    ;;
  status)
    $COMPOSE_CMD ps "$@"
    ;;
  shell)
    $COMPOSE_CMD exec web sh
    ;;

  # ── Development commands ─────────────────────────────────────────────────

  test)
    $COMPOSE_CMD exec web pnpm test "$@"
    ;;
  lint)
    $COMPOSE_CMD exec web pnpm lint "$@"
    ;;
  lint:fix)
    $COMPOSE_CMD exec web pnpm lint:fix "$@"
    ;;
  format)
    $COMPOSE_CMD exec web pnpm format "$@"
    ;;
  format:check)
    $COMPOSE_CMD exec web pnpm format:check "$@"
    ;;
  typecheck)
    $COMPOSE_CMD exec web pnpm typecheck "$@"
    ;;
  precheck)
    $COMPOSE_CMD exec web pnpm precheck "$@"
    ;;
  preview)
    $COMPOSE_CMD exec web pnpm preview "$@"
    ;;
  run)
    $COMPOSE_CMD exec web pnpm "$@"
    ;;

  # ── Lifecycle commands ─────────────────────────────────────────────────────

  clean)
    echo "This will remove the container and volumes."
    read -rp "Continue? [y/N] " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      $COMPOSE_CMD down -v
    else
      echo "Aborted."
    fi
    ;;
  fresh)
    echo "This will destroy the container, volumes, and images for this project."
    echo "Everything will be rebuilt from scratch."
    read -rp "Continue? [y/N] " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      $COMPOSE_CMD down -v --rmi local --remove-orphans
      echo ""
      echo "Clean slate. Run './fweb.sh up' to rebuild and start."
    else
      echo "Aborted."
    fi
    ;;
  build)
    $COMPOSE_CMD build --no-cache "$@"
    ;;
  setup)
    if [ ! -f .env ]; then
      cp .env.example .env
      echo "Created .env from .env.example"
    else
      echo ".env already exists, skipping copy."
    fi
    echo "Remember to fill in credentials in .env (Auth0, etc.)"
    ;;
  help|*)
    cat <<'USAGE'
Usage: ./fweb.sh <command> [args]

Services:
  up                     Start the dev server (build + detached)
  down                   Stop and remove the container
  restart                Restart the container
  logs                   Tail logs
  status                 Show container status
  shell                  Open a shell in the container

Development:
  test                   Run vitest test suite
  lint                   Run ESLint
  lint:fix               Run ESLint with auto-fix
  format                 Format code with Prettier
  format:check           Check formatting with Prettier
  typecheck              Run TypeScript type checking
  precheck               Run lint + format:check + typecheck + test
  preview                Preview the production build
  run <script>           Run a pnpm script inside the container

Lifecycle:
  clean                  Remove container and volumes
  fresh                  Nuke everything: container, volumes, and images
  build                  Rebuild container without cache
  setup                  Copy .env.example → .env if missing
USAGE
    ;;
esac
