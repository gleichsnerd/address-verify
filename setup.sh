#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the project
echo "Building project..."
npm run build

# Ensure dist directory exists
if [ ! -d "dist" ]; then
    echo "Error: Build failed - dist directory not created"
    exit 1
fi

# Create symlink to make command globally available
echo "Creating global symlink..."
sudo ln -sf "$DIR/address-verify" /usr/local/bin/address-verify

echo "Setup complete! You can now use 'address-verify' from anywhere."
