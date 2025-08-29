#!/bin/sh
echo "=== Post-clone script starting ==="
npm install
npx cap sync ios
mkdir -p ios/App/App
cp config.xml ios/App/App/
cp capacitor.config.json ios/App/App/
cp -r public ios/App/App/
echo "=== Files copied to iOS directory ==="
