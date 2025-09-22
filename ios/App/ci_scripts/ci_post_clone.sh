#!/usr/bin/env bash
set -euo pipefail

echo "=== Xcode Cloud post-clone (Capacitor) ==="
echo "PWD: $(pwd)"
echo "PATH: $PATH"

# 0) Work from the repo root
REPO_ROOT="${CI_WORKSPACE:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$REPO_ROOT"

# 1) Find the web app directory (where package.json lives)
WEB_DIR=""
if [ -f "package.json" ]; then
  WEB_DIR="$REPO_ROOT"
else
  for d in app frontend web ui client; do
    if [ -f "$REPO_ROOT/$d/package.json" ]; then WEB_DIR="$REPO_ROOT/$d"; break; fi
  done
fi
if [ -z "$WEB_DIR" ]; then
  echo "ERROR: Could not find package.json. Update this script with the correct web app path."
  exit 1
fi
echo "Web app dir: $WEB_DIR"
cd "$WEB_DIR"

# 2) Verify Node is available (Xcode Cloud images include Node). Do not install.
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not available on PATH. Ensure your Xcode Cloud image includes Node."
  exit 1
fi
node -v
npm -v

# 3) Use Corepack shims directly (no global enable to avoid symlink permission issues on CI)
#    We intentionally skip `corepack enable` to prevent EPERM errors in restricted environments.

# 4) Install dependencies using the right manager
if [ -f yarn.lock ]; then
  echo "Using yarn via corepack"
  corepack yarn --version || true
  corepack yarn install --frozen-lockfile
elif [ -f pnpm-lock.yaml ]; then
  echo "Using pnpm via corepack"
  corepack pnpm --version || true
  corepack pnpm install --frozen-lockfile
else
  echo "Using npm (ci)"
  npm ci
fi

# 5) Build the web app
if [ -f yarn.lock ]; then
  corepack yarn build
elif [ -f pnpm-lock.yaml ]; then
  corepack pnpm build
else
  npm run build
fi

# 6) Sync Capacitor so iOS has the assets in ios/App/App/public
cd "$REPO_ROOT"
npx cap sync ios

# 7) Verify assets landed where iOS expects them
ASSETS_DIR="ios/App/App/public"
echo "Contents of $ASSETS_DIR:"
ls -la "$ASSETS_DIR"
echo "=== Post-clone done ==="
