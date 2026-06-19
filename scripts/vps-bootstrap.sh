#!/usr/bin/env bash
#
# vps-bootstrap.sh — idempotent one-time (and safe-to-rerun) setup for the
# TechStore production host. Codifies the manual server state the deploy assumes,
# so the VPS stops drifting. Run as root on the VPS:
#
#   sudo bash scripts/vps-bootstrap.sh
#
# It is safe to run repeatedly — every step checks before acting and never
# overwrites real secrets.

set -euo pipefail

APP_DIR=/opt/techstore
SWAPFILE=/swapfile
SWAP_SIZE_GB=8

log()  { printf '\033[1;32m[bootstrap]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[bootstrap]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[bootstrap]\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Run as root (sudo bash scripts/vps-bootstrap.sh)."

# 1. App directory ------------------------------------------------------------
if [ ! -d "$APP_DIR" ]; then
  log "Creating $APP_DIR"
  mkdir -p "$APP_DIR"
else
  log "$APP_DIR already exists"
fi

# 2. Swap (prevents the OOM/137 kills during container startup) ---------------
if swapon --show=NAME --noheadings 2>/dev/null | grep -q "$SWAPFILE"; then
  log "Swap already active at $SWAPFILE"
elif [ -f "$SWAPFILE" ]; then
  log "Swapfile exists but is off — enabling"
  swapon "$SWAPFILE"
else
  log "Creating ${SWAP_SIZE_GB}G swap at $SWAPFILE"
  fallocate -l "${SWAP_SIZE_GB}G" "$SWAPFILE" || dd if=/dev/zero of="$SWAPFILE" bs=1M count=$((SWAP_SIZE_GB*1024))
  chmod 600 "$SWAPFILE"
  mkswap "$SWAPFILE"
  swapon "$SWAPFILE"
fi
if ! grep -q "^$SWAPFILE " /etc/fstab; then
  log "Persisting swap in /etc/fstab"
  echo "$SWAPFILE none swap sw 0 0" >> /etc/fstab
fi

# 3. Production env file (never overwrite real secrets) -----------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE="$SCRIPT_DIR/../.env.production.example"
if [ -f "$APP_DIR/.env" ]; then
  log "$APP_DIR/.env present — leaving it untouched"
else
  if [ -f "$EXAMPLE" ]; then
    cp "$EXAMPLE" "$APP_DIR/.env"
    warn "Created $APP_DIR/.env from template."
    die  "ACTION REQUIRED: edit $APP_DIR/.env and fill in real secrets, then re-run."
  else
    die "No $APP_DIR/.env and no template at $EXAMPLE — cannot continue."
  fi
fi

log "Bootstrap complete. Docker network/volumes are created by 'docker compose up'."
