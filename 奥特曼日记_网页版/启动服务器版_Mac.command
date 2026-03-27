#!/bin/bash
cd "$(dirname "$0")"
if command -v npx &>/dev/null; then
  echo "正在启动奥特曼日记..."
  open "http://localhost:8080"
  npx serve dist -p 8080
elif command -v python3 &>/dev/null; then
  echo "正在启动奥特曼日记..."
  cd dist && open "http://localhost:8080"
  python3 -m http.server 8080
else
  echo "未找到 Node.js 或 Python，请直接双击 打开奥特曼日记.html"
fi
