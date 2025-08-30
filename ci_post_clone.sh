#!/bin/sh
echo "=== Post-clone script starting ==="
pwd
ls -la

# Install Node.js and npm
echo "=== Installing Node.js ==="
if ! command -v node >/dev/null 2>&1; then
    # For Xcode Cloud, install Node.js via Homebrew
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || echo "Homebrew installation failed, trying alternative..."
    
    # Add Homebrew to PATH for this session
    eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv 2>/dev/null)" || true
    
    # Install Node.js
    if command -v brew >/dev/null 2>&1; then
        echo "Installing Node.js via Homebrew..."
        brew install node
    else
        # Fallback: install Node.js directly
        echo "Installing Node.js via direct download..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install --lts
        nvm use --lts
    fi
else
    echo "Node.js already installed"
fi

# Verify installations
echo "=== Verifying Node.js and npm ==="
node --version || echo "Node.js not found"
npm --version || echo "npm not found"

echo "=== Installing npm dependencies ==="
npm install || npm ci || echo "npm install failed"

echo "=== Syncing Capacitor ==="
npx cap sync ios || echo "Capacitor sync failed"

echo "=== Building web app ==="
npm run build || echo "Build failed"

echo "=== Checking files before copying ==="
ls -la config.xml capacitor.config.json dist/ public/ || echo "Some files missing"

echo "=== Copying files to iOS directory ==="
mkdir -p ios/App/App
cp config.xml ios/App/App/ && echo "config.xml copied" || echo "config.xml copy failed (may not exist)"
cp capacitor.config.json ios/App/App/ && echo "capacitor.config.json copied" || echo "capacitor.config.json copy failed (may not exist)"

# Copy the built web app
if [ -d "dist" ]; then
    mkdir -p ios/App/App/public
    cp -r dist/* ios/App/App/public/ && echo "Built app copied to public folder" || echo "Built app copy failed"
elif [ -d "public" ]; then
    cp -r public ios/App/App/ && echo "public folder copied" || echo "public folder copy failed"
else
    echo "Warning: No dist or public folder found"
fi

echo "=== Verifying files in iOS directory ==="
ls -la ios/App/App/
echo "=== Post-clone script completed ==="
