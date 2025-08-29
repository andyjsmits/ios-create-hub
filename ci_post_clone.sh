#!/bin/sh
echo "=== Post-clone script starting ==="
pwd
ls -la

echo "=== Installing npm dependencies ==="
npm install

echo "=== Syncing Capacitor ==="
npx cap sync ios

echo "=== Checking files before copying ==="
ls -la config.xml capacitor.config.json public/ || echo "Some files missing"

echo "=== Copying files to iOS directory ==="
mkdir -p ios/App/App
cp config.xml ios/App/App/ && echo "config.xml copied" || echo "config.xml copy failed"
cp capacitor.config.json ios/App/App/ && echo "capacitor.config.json copied" || echo "capacitor.config.json copy failed"
cp -r public ios/App/App/ && echo "public folder copied" || echo "public folder copy failed"

echo "=== Verifying files in iOS directory ==="
ls -la ios/App/App/
echo "=== Post-clone script completed ==="
