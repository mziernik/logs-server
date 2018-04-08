@echo off
cd ui
cmd /c npm run "build PROD"
cd ..
cmd /c mvn package
pause