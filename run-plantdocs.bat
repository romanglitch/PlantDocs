@echo off
echo Loading...

:: Backend
cd /d "C:\Users\romanglitch\Dev\PlantDocs_old\backend"
start cmd /k "npm start"

:: Frontend
cd /d "C:\Users\romanglitch\Dev\PlantDocs_old\frontend"
start cmd /k "serve -s build"

echo Plantdocs successfully loaded!
exit