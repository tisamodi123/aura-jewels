#!/bin/bash
set -euo pipefail

############################################################
# Configuration
############################################################

APP_NAME="aura-jewels-admin"
BRANCH="main"
APP_DIR="$(pwd)"

############################################################
# Start
############################################################

echo ""
echo "=============================================="
echo "🚀 Aura Jewels Admin Deployment Started"
echo "=============================================="
echo ""

cd "$APP_DIR"

############################################################
# Verify project
############################################################

[ -f package.json ] || { echo "❌ package.json not found."; exit 1; }
[ -f ecosystem.config.cjs ] || { echo "❌ ecosystem.config.cjs not found."; exit 1; }

git config --global --add safe.directory "$APP_DIR"

############################################################
# Verify working tree
############################################################

if [[ -n $(git status --porcelain) ]]; then
    echo ""
    echo "❌ Uncommitted changes found."
    git status
    exit 1
fi

############################################################
# Fetch latest
############################################################

echo ""
echo "📡 Fetching latest changes..."
git fetch origin

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$BRANCH)

############################################################
# Nothing to deploy
############################################################

if [ "$LOCAL" = "$REMOTE" ]; then
    echo ""
    echo "✅ Already up to date."
    exit 0
fi

############################################################
# Incoming commits
############################################################

echo ""
echo "=============================================="
echo "📜 Incoming Commits"
echo "=============================================="

git log --oneline HEAD..origin/$BRANCH

############################################################
# Changed files
############################################################

echo ""
echo "=============================================="
echo "📂 Files Changed"
echo "=============================================="

git diff --stat HEAD..origin/$BRANCH

############################################################
# Code additions/deletions
############################################################

echo ""
echo "=============================================="
echo "📊 Code Changes"
echo "=============================================="

git diff --numstat HEAD..origin/$BRANCH | while read -r added deleted file
do
    printf "%-60s +%-6s -%-6s\n" "$file" "$added" "$deleted"
done

############################################################
# Update source
############################################################

echo ""
echo "⬇️ Updating source code..."

git reset --hard origin/$BRANCH

############################################################
# Install dependencies
############################################################

echo ""
echo "📦 Installing dependencies..."

npm ci

############################################################
# Build
############################################################

echo ""
echo "🏗 Building application..."

rm -rf .next
npm run build

############################################################
# Restart PM2
############################################################

echo ""
echo "🔄 Restarting PM2..."

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 restart "$APP_NAME" --update-env
else
    pm2 start ecosystem.config.cjs --only "$APP_NAME"
fi

pm2 save

############################################################
# Finished
############################################################

echo ""
echo "=============================================="
echo "✅ Deployment Successful"
echo "=============================================="

pm2 status "$APP_NAME"