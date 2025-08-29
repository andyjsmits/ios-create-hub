#!/bin/sh
echo "Running post-clone script..."
npm install
echo "Syncing Capacitor..."
npx cap sync ios
echo "Copying config files to iOS directory..."
cp config.xml ios/App/App/
cp capacitor.config.json ios/App/App/
cp -r public ios/App/App/ 2>/dev/null || echo "No public folder to copy"
echo "Post-clone script completed"
