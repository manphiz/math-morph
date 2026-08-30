#!/bin/sh
set -e

# Xcode Cloud runs this script in the directory where it's located (ios/App/ci_scripts)
echo "Installing Node.js via Homebrew..."
brew install node

echo "Navigating to project root..."
cd ../../../

echo "Installing npm dependencies..."
npm ci

echo "Building web assets..."
npm run build

echo "Syncing Capacitor project..."
npx cap sync ios

echo "ci_pre_xcodebuild.sh completed successfully."
