#!/bin/bash
cd "$(dirname "$0")"
export PATH="/usr/local/bin:$PATH"
echo "🦸 奥特曼日记启动中..."
echo ""
npm run dev &
sleep 2
open http://localhost:5173
wait
