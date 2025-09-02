#!/bin/sh
echo "=== Post-clone script starting ==="
echo "PWD: $(pwd)"
echo "USER: $(whoami)"
echo "PATH: $PATH"

# Install Node.js and npm
echo "=== Installing Node.js ==="
if ! command -v node >/dev/null 2>&1; then
    # For Xcode Cloud, install Node.js via Homebrew
    echo "Installing Homebrew..."
    NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || echo "Homebrew installation failed, trying alternative..."
    
    # Add Homebrew to PATH for this session (both possible locations)
    export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
    eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv 2>/dev/null)" || true
    
    # Install Node.js
    if command -v brew >/dev/null 2>&1; then
        echo "Installing Node.js via Homebrew..."
        brew install node
        # Update PATH to include node
        export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
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
echo "Updated PATH: $PATH"
node --version || echo "Node.js not found after installation"
npm --version || echo "npm not found after installation"
which node || echo "node location unknown"
which npm || echo "npm location unknown"

# Install dependencies
echo "=== Installing npm dependencies ==="
if command -v npm >/dev/null 2>&1; then
    npm install || npm ci || echo "npm install failed"
else
    echo "ERROR: npm still not available after installation"
    exit 1
fi

# Build the web app
echo "=== Building web app ==="
if command -v npm >/dev/null 2>&1; then
    npm run build || echo "Build failed"
    echo "Checking if dist folder was created..."
    ls -la dist/ || echo "No dist folder found after build"
else
    echo "ERROR: npm not available for build"
    exit 1
fi

# Sync Capacitor
echo "=== Syncing Capacitor ==="
if command -v npx >/dev/null 2>&1; then
    npx cap sync ios || echo "Capacitor sync failed"
else
    echo "ERROR: npx not available for Capacitor sync"
fi

# Copy files
echo "=== Copying files to iOS directory ==="
mkdir -p ios/App/App
cp config.xml ios/App/App/ 2>/dev/null || echo "config.xml copy failed (may not exist)"
cp capacitor.config.json ios/App/App/ 2>/dev/null || echo "capacitor.config.json copy failed (may not exist)"

# Copy the built web app
if [ -d "dist" ] && [ "$(ls -A dist 2>/dev/null)" ]; then
    mkdir -p ios/App/App/public
    cp -r dist/* ios/App/App/public/ && echo "Built app copied to public folder" || echo "Built app copy failed"
    echo "Contents of ios/App/App/public:"
    ls -la ios/App/App/public/ || echo "Could not list public folder contents"
elif [ -d "public" ] && [ "$(ls -A public 2>/dev/null)" ]; then
    cp -r public ios/App/App/ && echo "Public folder copied" || echo "Public folder copy failed"
else
    echo "ERROR: No dist or public folder found to copy"
    exit 1
fi

echo "=== Verifying files in iOS directory ==="
ls -la ios/App/App/ || echo "iOS App directory not accessible"
echo "=== Post-clone script completed successfully ==="
