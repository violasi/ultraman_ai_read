@echo off
chcp 65001 >/dev/null
cd /d "%~dp0"
where npx >/dev/null 2>/dev/null
if %ERRORLEVEL%==0 (
  echo 正在启动奥特曼日记...
  start http://localhost:8080
  npx serve dist -p 8080
  goto :eof
)
where python >/dev/null 2>/dev/null
if %ERRORLEVEL%==0 (
  start http://localhost:8080
  cd dist
  python -m http.server 8080
  goto :eof
)
echo 请直接双击"打开奥特曼日记.html"
pause
