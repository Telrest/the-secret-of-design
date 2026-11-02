@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 (
  node "%~dp0scripts\serve.mjs" --open
  pause
  exit /b
)
where py >nul 2>nul
if not errorlevel 1 (
  echo 请保持此窗口打开，浏览器地址：http://127.0.0.1:5185/
  start "" "http://127.0.0.1:5185/"
  py -3 -m http.server 5185 --bind 127.0.0.1 --directory "%~dp0dist"
  pause
  exit /b
)
echo 请先安装 Node.js 24，再重新双击本文件。
echo 也可以直接访问在线版：https://telrest.github.io/the-secret-of-design/
pause
