#!/usr/bin/env bash
# Monta o pacote .zip para enviar ao CrazyGames (portal de jogos HTML5).
# Uso: bash tools/build-crazygames.sh   -> dist/shoot-lines-crazygames.zip
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist/crazygames && mkdir -p dist/crazygames/fonts
cp index.html game.js platform.js dist/crazygames/
cp fonts/*.woff2 fonts/OFL.txt dist/crazygames/fonts/
(cd dist/crazygames && rm -f ../shoot-lines-crazygames.zip && zip -qr ../shoot-lines-crazygames.zip .)
echo "Pacote: dist/shoot-lines-crazygames.zip ($(du -h dist/shoot-lines-crazygames.zip | cut -f1))"
