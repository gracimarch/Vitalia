#!/bin/bash
# ─────────────────────────────────────────────
# Vitalia Legacy — HTML/CSS Version
# Commit: b8151fd (pre-Next.js migration)
# ─────────────────────────────────────────────

PORT=${1:-8080}
DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill any existing process on this port
lsof -ti tcp:$PORT | xargs kill -9 2>/dev/null

# Prefer server.py with native Vercel rewrites & 404 support
if [ -f "$DIR/server.py" ]; then
    python3 "$DIR/server.py" "$PORT"
else
    echo "  → http://localhost:$PORT"
    python3 -m http.server $PORT --directory "$DIR"
fi
