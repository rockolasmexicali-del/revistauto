@echo off
echo Generando respaldo de la Revista de Autos...

:: Obtener fecha y hora en un formato compatible con carpetas de Windows
set "fecha=%date:/=-%"
set "hora=%time::=-%"
set "hora=%hora: =0%"
set "hora=%hora:~0,8%"

set "nombre_backup=backup_revista_%fecha%_%hora%"

:: Crear carpeta de respaldo
mkdir "%nombre_backup%"

:: Copiar archivos del proyecto
echo Copiando archivos...
copy index.html "%nombre_backup%\" >nul
copy style.css "%nombre_backup%\" >nul
copy app.js "%nombre_backup%\" >nul
copy db.js "%nombre_backup%\" >nul
copy package.json "%nombre_backup%\" >nul
copy iniciar.bat "%nombre_backup%\" >nul

echo.
echo Respaldo completado exitosamente!
echo Los archivos se guardaron en la carpeta: %nombre_backup%
echo.
pause
