#!/bin/bash
set -e

echo "🚀 Starting Frontend Deployment..."

APP_NAME="aura-jewels"
BRANCH="main"
APP_DIR="$(pwd)"

cd $APP_DIR || exit 1

if [ ! -f ecosystem.config.cjs ]; then
  echo "❌ ecosystem.config.cjs missing"
  exit 1
fi

git config --global --add safe.directory $APP_DIR

echo "📍 Current branch:"
git rev-parse --abbrev-ref HEAD

if [[ -n $(git status --porcelain) ]]; then
  echo "❌ Uncommitted changes detected"
  git status
  exit 1
fi

echo "⬇️ Fetching latest code..."
git fetch origin

echo "📥 Pulling latest code..."
git pull origin $BRANCH

echo "🧹 Cleaning old build..."
rm -rf .next

echo "📦 Installing dependencies..."
npm ci

echo "🏗 Building application..."
npm run build

echo "🔄 Restarting PM2..."

if pm2 describe $APP_NAME > /dev/null; then
  pm2 restart $APP_NAME --update-env
else
  pm2 start ecosystem.config.cjs --only $APP_NAME
fi

pm2 save

echo "✅ Deployment completed!"