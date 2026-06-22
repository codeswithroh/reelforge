#!/bin/bash

# ReelForge Local Demo Launcher
# Run this script to start the app locally for a demo video

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Change to project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/bundle"

echo ""
echo -e "${CYAN}====================================${NC}"
echo -e "${CYAN}  ReelForge Local Demo${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""

# Find an available port
PORT=8765

echo -e "${YELLOW}Starting local server on port $PORT...${NC}"

# Start Python server in background
python3 -m http.server $PORT > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 2

echo -e "${GREEN}Server running!${NC}"
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Open this URL in your browser:${NC}"
echo -e "${CYAN}  http://localhost:$PORT${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${YELLOW}Demo script (60 seconds):${NC}"
echo "1. Paste a video description"
echo "2. Click 'Analyze footage'"
echo "3. Click '30-second hook' preset, then 'Propose clips'"
echo "4. Keep 2 clips, Cut 1"
echo "5. Click 'Assemble final cut'"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Open browser (works on macOS, Linux, Windows)
if command -v open > /dev/null 2>&1; then
    open "http://localhost:$PORT"
elif command -v xdg-open > /dev/null 2>&1; then
    xdg-open "http://localhost:$PORT"
else
    echo "Please open the URL manually in your browser."
fi

# Wait for Ctrl+C
trap "echo ''; echo -e '${GREEN}Stopping server...${NC}'; kill $SERVER_PID 2>/dev/null; exit 0" INT
wait $SERVER_PID
