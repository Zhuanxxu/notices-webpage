# Script de configuración para Windows PowerShell

Write-Host "=== Configuración de Página de Noticias ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si existen los archivos .env
$backendEnv = "backend\.env"
$frontendEnv = "frontend\.env.local"

if (-not (Test-Path $backendEnv)) {
    Write-Host "Creando backend\.env..." -ForegroundColor Yellow
    @"
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=noticias_db
DB_USER=agust
DB_PASSWORD=112358

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=tu_secreto_jwt_muy_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=7d
"@ | Out-File -FilePath $backendEnv -Encoding utf8
    Write-Host "✓ backend\.env creado" -ForegroundColor Green
} else {
    Write-Host "✓ backend\.env ya existe" -ForegroundColor Green
}

if (-not (Test-Path $frontendEnv)) {
    Write-Host "Creando frontend\.env.local..." -ForegroundColor Yellow
    @"
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
"@ | Out-File -FilePath $frontendEnv -Encoding utf8
    Write-Host "✓ frontend\.env.local creado" -ForegroundColor Green
} else {
    Write-Host "✓ frontend\.env.local ya existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Verificando dependencias ===" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias del proyecto raíz..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Instalando dependencias del backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "=== Verificando base de datos ===" -ForegroundColor Cyan
Write-Host "Asegúrate de que PostgreSQL esté corriendo y que la base de datos 'noticias_db' exista." -ForegroundColor Yellow
Write-Host "Para crear la base de datos, ejecuta:" -ForegroundColor Yellow
Write-Host "  psql -U agust -c `"CREATE DATABASE noticias_db;`"" -ForegroundColor White
Write-Host "  psql -U agust -d noticias_db -f database\schema.sql" -ForegroundColor White
Write-Host ""

Write-Host "=== Configuración completada ===" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Verifica que PostgreSQL esté corriendo" -ForegroundColor White
Write-Host "2. Crea la base de datos 'noticias_db' si no existe" -ForegroundColor White
Write-Host "3. Ejecuta el schema.sql en la base de datos" -ForegroundColor White
Write-Host "4. Ejecuta 'npm run dev' para iniciar el proyecto" -ForegroundColor White
Write-Host ""
