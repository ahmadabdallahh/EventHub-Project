#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FLY="$HOME/.fly/bin/flyctl"
APP="redux-events-backend"

print_usage() {
  echo "Usage:"
  echo "  scripts/auto-deploy.sh              Deploy backend if it changed vs origin/<branch>"
  echo "  scripts/auto-deploy.sh FROM TO      Deploy backend if files changed between FROM and TO"
  echo "  scripts/auto-deploy.sh --check ...  Same but only report (no deploy)"
  echo "  scripts/auto-deploy.sh --hook       Read ref updates from git post-push stdin"
}

backend_changed() {
  local from="$1" to="$2"
  git -C "$REPO_ROOT" diff --name-only "$from" "$to" 2>/dev/null | grep -q '^backend/'
}

deploy() {
  if [ "${CHECK_ONLY:-0}" = "1" ]; then
    echo ">> backend/ changed -> would run: flyctl deploy --app $APP (check mode)"
    return 0
  fi
  echo ">> Backend changed -> deploying to Fly ($APP)..."
  (cd "$REPO_ROOT/backend" && "$FLY" deploy -y -a "$APP")
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  print_usage
  exit 0
fi

CHECK_ONLY=0
if [ "${1:-}" = "--check" ]; then
  CHECK_ONLY=1
  shift
fi

if [ "${1:-}" = "--hook" ]; then
  # git post-push feeds: <local ref> <local sha> <remote ref> <remote sha> per pushed ref
  matched=0
  while read -r local_ref local_sha remote_ref remote_sha; do
    [ -n "$local_ref" ] || continue
    echo "$local_ref" | grep -q '^refs/heads/' || continue
    [ "$remote_sha" != "0000000000000000000000000000000000000000" ] || continue
    if backend_changed "$remote_sha" "$local_sha"; then
      matched=1
    fi
  done
  if [ "$matched" = "1" ]; then
    deploy
  else
    echo ">> No backend/ changes pushed -> skipping deploy"
  fi
  exit 0
fi

if [ $# -eq 2 ]; then
  FROM="$1"; TO="$2"
elif [ $# -eq 0 ]; then
  BRANCH="$(git -C "$REPO_ROOT" symbolic-ref --short HEAD 2>/dev/null || echo main)"
  FROM="origin/$BRANCH"; TO="HEAD"
else
  print_usage
  exit 1
fi

if backend_changed "$FROM" "$TO"; then
  deploy
else
  echo ">> No backend/ changes between $FROM..$TO -> skipping deploy"
fi