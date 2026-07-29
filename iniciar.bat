@echo off
echo Iniciando servidor Node.js para la Revista de Autos...
echo.
echo NOTA: Si es la primera vez que lo corres, asegurate de ejecutar "npm install" primero.
echo (Se abrira Chrome automaticamente en unos segundos...)
echo.

:: Abre chrome despues de un pequeño retraso
start chrome http://localhost:3000

:: Inicia servidor
node server.js

pause
