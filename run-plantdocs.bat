@echo off
echo Loading...

:: Backend
cd /d "D:\GLITCHWEB\plant-docs\backend"
start cmd /k "npm start"

:: Frontend
cd /d "D:\GLITCHWEB\plant-docs\frontend"
start cmd /k "serve -s build"

echo Plantdocs successfully loaded!
exit