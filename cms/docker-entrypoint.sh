#!/bin/sh
set -e

echo "🚀 Checking Strapi installation..."

if [ -f "package.json" ]; then
    echo "📦 package.json found. Installing dependencies..."
    npm install
    echo "✅ Dependencies installed. Starting Strapi..."
    npm run develop
else
    echo "❌ No package.json found. Bu olmamaliydi, kurulum zaten yapildi."
    # Eğer package.json yoksa yine de develop modunda başlatmayı dene (dosyalar mount edilecek)
    npm run develop
fi