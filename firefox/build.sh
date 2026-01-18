#!/bin/bash
# Build script for Firefox version of Paintbrush
# Run from the project root: ./firefox/build.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FIREFOX_DIR="$SCRIPT_DIR"
EXTENSION_DIR="$PROJECT_ROOT/extension"

echo "Building Firefox extension..."
echo "Source: $EXTENSION_DIR"
echo "Target: $FIREFOX_DIR"

# Copy all files from extension except manifest.json
cp -r "$EXTENSION_DIR/icons" "$FIREFOX_DIR/"
cp -r "$EXTENSION_DIR/lib" "$FIREFOX_DIR/"
cp -r "$EXTENSION_DIR/content" "$FIREFOX_DIR/"
cp -r "$EXTENSION_DIR/popup" "$FIREFOX_DIR/"
cp "$EXTENSION_DIR/background.js" "$FIREFOX_DIR/"

echo ""
echo "Done! Firefox extension built in: $FIREFOX_DIR"
echo ""
echo "To load in Firefox:"
echo "1. Open Firefox and go to about:debugging"
echo "2. Click 'This Firefox' in the left sidebar"
echo "3. Click 'Load Temporary Add-on...'"
echo "4. Select: $FIREFOX_DIR/manifest.json"
